import User from "../models/Adminuser.model.js";
import { errorHandler } from "../utils/error.js";
import UserModel from "../models/user.model.js";
import bdcrpytjs from "bcryptjs";
export const test = (req, res) => {
  res.json({ message: "API is working!!!!!" });
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Signout success" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not allowed to perform this action")
    );
  }
  if (req.body.password) {
    if (req.body.password.lenght < 6) {
      return next(
        errorHandler(403, "Password must be at least 6 characters long")
      );
    }
    req.body.password = bdcrpytjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(403, "Username must be between 7 and 20 characters long")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(403, "Username must not contain spaces"));
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(403, "Username must be in lowercase"));
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(403, "Username must contain only letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not allowed to delete this account")
    );
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getusers = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const usersWithourPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });
    const totalUser = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUser = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res
      .status(200)
      .json({ users: usersWithourPassword, totalUser, lastMonthUser });
  } catch (error) {}
};

export const getUser = async (req,res,next) => {
  try {
    const user=await User.findById(req.params.userId);
    if(!user){
      return next(errorHandler(404,'User not found'));
    }
    const {password,...rest}=user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
}

export const getAppUsers=async(req,res,next)=>{
  try {
    const users=await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({message:error.message});
  }
}
