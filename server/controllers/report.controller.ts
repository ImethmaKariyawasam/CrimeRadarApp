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
import Report from "../models/report.model";
import UserModel from "../models/user.model";
require("dotenv").config();

interface IReportBody {
  userId: string;
  noticeId: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  description: string;
}
export const createReport = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, noticeId, location, description }: IReportBody = req.body;
      if (!userId || !noticeId || !location || !description) {
        return next(
          new ErrorHandler("Please provide all the required fields", 400)
        );
      }
      const report = await Report.create({
        userId,
        noticeId,
        location,
        description,
      });
      const user = await UserModel.findById(userId);
      const notice = await NoticeBoard.findById(noticeId);

      if (user?.email) {
        await sendMail({
          email: user.email,
          subject: "Crime Radar - Report Submitted",
          template: "report-confirmation.ejs",
          data: {
            user: { name: user.name },
            notice: { name: notice?.name },
          },
        });
      } else {
        console.log("");
      }
      res.status(201).json({
        success: true,
        report,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getReports = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await Report.find()
        .populate("userId")
        .populate("noticeId");
      res.status(200).json({
        success: true,
        reports,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getNoOfReportsTodayForUserID = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    // Get the start and end of the current day (UTC)
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0); // Start of today (00:00:00)

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999); // End of today (23:59:59)

    try {
      const reportsToday = await Report.countDocuments({
        userId: userId,
        createdAt: {
          $gte: startOfToday, // Match reports from the start of today
          $lt: endOfToday, // Match reports before the start of the next day
        },
      });
      console.log(reportsToday);

      // Respond with the count of reports for today
      res.status(200).json({
        success: true,
        reportsToday, // Number of reports made by the user today
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500)); // Error handling
    }
  }
);
