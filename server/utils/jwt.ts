require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";
import { RedisKey } from "ioredis";

interface IActivationToken {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  samesite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

//parse environment variables to integrates with fallback values
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "1200",
  10
);

export const accessTokenOptions: IActivationToken = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  samesite: "lax",
};

export const refreshTokenOptions: IActivationToken = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  samesite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session to redis
  redis.set(user._id as RedisKey, JSON.stringify(user) as any);

  //only set secure in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};
