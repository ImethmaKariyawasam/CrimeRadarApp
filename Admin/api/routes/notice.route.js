import express from 'express';
import { getNotices, addNotice, deleteNotice, updateNotice,generateNoticeReport } from '../controller/notice.controller.js';

const router = express.Router();

router.get('/getNotices', getNotices);
router.post('/createNotice', addNotice);
router.delete('/deleteNotice/:noticeId', deleteNotice);
router.put('/updateNotice/:noticeId', updateNotice);
router.post('/generateReport',generateNoticeReport);
export default router;
