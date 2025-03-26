import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import appUserRoutes from "./routes/appUser.route.js";
import inquiryRoutes from "./routes/inquiry.route.js";
import cookieParser from "cookie-parser";
import noticeRoutes from "./routes/notice.route.js";
import reportRoutes from "./routes/report.route.js";
import articleRoutes from "./routes/article.route.js";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/app", appUserRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/article", articleRoutes);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
