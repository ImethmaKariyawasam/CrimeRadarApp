import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import Post from "../models/article.model";

export const getPosts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await Post.find();
      res.status(200).json(posts);
    } catch (error) {
      if (error instanceof Error) {
        next(new ErrorHandler(error.message, 500));
      } else {
        next(new ErrorHandler("An unknown error occurred", 500));
      }
    }
  }
);
