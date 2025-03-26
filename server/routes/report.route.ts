import express from "express";
import {
  createReport,
  getNoOfReportsTodayForUserID,
  getReports,
} from "../controllers/report.controller";
import { isAutheticated } from "../middleware/auth";
const reportRouter = express.Router();

reportRouter.post("/createReport", isAutheticated, createReport);
reportRouter.get("/getReports", getReports);
reportRouter.get(
  "/noOfReports/:userId",
  isAutheticated,
  getNoOfReportsTodayForUserID
);

export default reportRouter;
