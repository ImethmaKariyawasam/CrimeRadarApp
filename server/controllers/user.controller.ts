import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import crypto from "crypto";
import sendMail from "../utils/sendmail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { Redis, RedisKey } from "ioredis";
import { get } from "http";
import { getUserById } from "../services/user.service";
import cloudinary from "cloudinary";

require("dotenv").config();
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: IRegistrationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );
      try {
        await sendMail({
          email: user.email,
          subject: "Crime Radar Account Activation",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `An email has been sent to ${user.email}. Please check your email to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

//activate user account
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("User Email is already Registered", 400));
      }
      const user = await userModel.create({
        name,
        email,
        password,
        isVerified: true,
      });
      res.status(201).json({
        success: true,
        message: "Account has been activated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Login User
interface ILoginBody {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginBody;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Logout User

export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("accessToken", "", { maxAge: 1 });
      res.cookie("refreshToken", "", { maxAge: 1 });
      const userId = req.user?._id || "";
      redis.del(userId as RedisKey);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resfreshToken = req.cookies.refreshToken as string;
      const decoded = jwt.verify(
        resfreshToken,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler(message, 400));
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Get User Info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId as string, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IForgotPasswordBody {
  email: string;
}

//Forgot Password
export const forgotPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as IForgotPasswordBody;
      const user = await userModel.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
      }
      const randomPassword = crypto.randomBytes(8).toString("hex");
      user.password = randomPassword;
      await user.save();

      const data = { user: { name: user.name }, password: randomPassword };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/reset-password.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Crime Radar Password Reset",
          template: "reset-password.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `An email has been sent to ${user.email}. Please check your email to receive your new password`,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IScoailAuthBody {
  email: string;
  name: string;
  avatar: string;
}
//Social auth
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as IScoailAuthBody;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({
          name,
          email,
          avatar,
        });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IUpdateProfilePicture {
  avatar: string;
}

// update profile picture
export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateProfilePicture;

      const userId = req.user?._id;

      const user = await userModel.findById(userId).select("+password");

      if (avatar && user) {
        // if user have one avatar then call this if
        if (user?.avatar?.public_id) {
          // first delete the old image
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();

      await redis.set(userId as RedisKey, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IUpdateUserProfile {
  userId?:string,
  name?: string;
  phoneNo?: string;
  NIC?: string;
}

export const updateUserDetails = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, name, phoneNo, NIC }: IUpdateUserProfile = req.body;

    try {
      // Find the user by ID
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Validate phone number (must be 10 digits)
      if (phoneNo && !/^\d{10}$/.test(phoneNo)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      // Validate NIC (must be 12 characters)
      if (NIC && NIC.length !== 12) {
        return res.status(400).json({
          success: false,
          message: "NIC must be 12 characters long",
        });
      }

      // Update only the allowed fields
      if (name) user.name = name;
      if (phoneNo) user.phoneNo = phoneNo;
      if (NIC) user.NIC = NIC;

      // Save the updated user
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating user profile",
        error: (error as any).message,
      });
    }
  }
);

// update user password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }

      const user = await userModel.findById(req.body.userId).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      user.password = newPassword;

      await user.save();

      await redis.set(req.user?._id as RedisKey, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
