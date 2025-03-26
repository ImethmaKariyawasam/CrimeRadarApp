import express from 'express';
import { deleteReport, generateNoticeReport, getReports, verifyReport } from '../controller/report.controller.js';


const router = express.Router();

router.get("/getReports",getReports);
router.delete("/deleteReport/:id",deleteReport);
router.put("/verifyReport/:id",verifyReport);
router.post("/generateReport",generateNoticeReport);

export default router;