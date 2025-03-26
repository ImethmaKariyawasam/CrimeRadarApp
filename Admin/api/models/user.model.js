import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

const userSchema = new mongoose.Schema(
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
        validator: function (value) {
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
    phoneNo: {
      type: String,
      minlength: [10, "Your phone no must be having at least 6 digits"],
      default: "0751234567",
    },
    NIC: {
      type: String,
      minlength: [10, "Your NIC must be at least 6 digits long"],
      default: "200121810644",
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

// Hash Password Before Saving User
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
