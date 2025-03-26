import express from "express";
import { createNotice, getNotice, publishNotice } from "../controllers/notices.controller";
import { defaultMaxListeners } from "events";
import { isAutheticated } from "../middleware/auth";
const noticeRouter = express.Router();

noticeRouter.post("/createNotice",createNotice);
noticeRouter.get("/getNotice", isAutheticated,getNotice);
noticeRouter.post("/publishNotice",isAutheticated, publishNotice);
export default noticeRouter;
