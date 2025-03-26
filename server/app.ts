import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import noticeRouter from "./routes/notice.route";
import dialogflowRouter from "./routes/dialogflow.route";
import reportRouter from "./routes/report.route";
import articleRouter from "./routes/article.route";
import advertisementRouter from "./routes/advertisement.route";
require("dotenv").config();
// Body Parser
app.use(express.json({ limit: "50mb" }));

//Cookie Parser
app.use(cookieParser());

//cors => Cross Origin Resource Sharing(CORS).
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

//router USER
app.use("/api/user", userRouter);
app.use("/api/notice", noticeRouter);
app.use("/api/dialogflow", dialogflowRouter);
app.use("/api/report", reportRouter);
app.use("/api/article", articleRouter);
app.use("/api/advertisements", advertisementRouter);
//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working fine",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server`) as any;
  err.statuscode = 404;
  next(err);
});

app.use(ErrorMiddleware);
