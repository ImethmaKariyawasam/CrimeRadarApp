import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import NoticeBoard, { INotice } from "../models/notice.model";
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
require("dotenv").config();

interface INoticeBody {
  type: string;
  name: string;
  age: Number;
  image: String;
  thumbnail: String;
  height: Number;
  weight: Number;
  eye_color: String;
  hair_color: String;
  distinctive_marks: String;
  alias: String;
  description: string;
  missingdate: Date;
  dangerLevel: string;
  location: {
    type: string;
    coordinates: [Number];
  };
}

export const createNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        type,
        name,
        age,
        image,
        thumbnail,
        height,
        weight,
        eye_color,
        hair_color,
        distinctive_marks,
        alias,
        description,
        missingdate,
        dangerLevel,
        location,
      } = req.body;
      const notice: INoticeBody = {
        type,
        name,
        age,
        image,
        thumbnail,
        height,
        weight,
        eye_color,
        hair_color,
        distinctive_marks,
        alias,
        description,
        missingdate,
        dangerLevel,
        location,
      };
      const newNotice = new NoticeBoard(notice);
      await newNotice.save();
      res.status(201).json({
        success: true,
        message: "Notice Created Successfully",
        notice: newNotice,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notices = await NoticeBoard.find(); // Changed variable name to plural to reflect multiple results
      res.status(200).json({
        success: true,
        data: notices, // Updated to a more descriptive key name
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500)); // Updated status code to 500 for server errors
    }
  }
);

// Define the interface for the notice data
interface IPublishNotice {
  userId: string;
  type: string;
  name: string;
  age: string;
  description: string;
  height: string;
  weight: string;
  eye_color: string;
  hair_color: string;
  distinctive_marks: string;
  location: {
    type: string;
    coordinates: number[];
  };
  image: string;
  thumbnail:string;
  missingDate: string; // Use ISO 8601 string format for dates
}

// Define the publishNotice function using the interface
export const publishNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Cast the request body to IPublishNotice
      const {
        userId,
        type,
        name,
        age,
        height,
        weight,
        eye_color,
        hair_color,
        distinctive_marks,
        description,
        missingdate,
        location,
        imageUrl,
      } = req.body;

      const noticeData: IPublishNotice = req.body;

      console.log(noticeData)

      // Create a new notice document
      const newNoticeData : IPublishNotice = {
        userId,
        type,
        name,
        age,
        thumbnail:imageUrl,
        image:imageUrl,
        height,
        weight,
        eye_color,
        hair_color,
        distinctive_marks,
        description,
        missingDate:missingdate,
        location,
      };

      const newNotice = new NoticeBoard(newNoticeData);
      await newNotice.save();
      // Send a success response
      res.status(201).json({
        success: true,
        message: "Notice published successfully",
        notice: newNotice,
      });
    } catch (error: any) {
      console.log(error)
      next(new ErrorHandler(error.message, 400));
    }
  }
);
