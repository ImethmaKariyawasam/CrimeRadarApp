import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";
const emailRegexPattern: RegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  phoneNo:string;
  NIC:string;
  role: string;
  isVerified: boolean;
  searchNotices: Array<{ searchNoticeID: string }>;
  comparePassword(password: string): Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      minlength: [6, "Your password must be at least 6 characters long"],
      select: false,
    },
    phoneNo:{
      type:String,
      minlength: [10, "Your phone no must be having at least 6 digits"],
      default:"0751234567"
    },
    NIC:{
      type:String,
      minlength: [10, "Your phone no must be having at least 6 digits"],
      default:"200121810644"
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    searchNotices: [
      {
        searchNoticeID: String,
      },
    ],
  },
  { timestamps: true }
);

//Hash Password Before Saving User
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//sign access token
userSchema.methods.SignAccessToken= function (){
  return jwt.sign({id:this._id},process.env.ACCESS_TOKEN ||'',{expiresIn:"5m"});
}

//sign refresh token
userSchema.methods.SignRefreshToken= function (){
  return jwt.sign({id:this._id},process.env.REFRESH_TOKEN ||'',{expiresIn:"3d"});
}

//Compare Password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);
export default UserModel;
