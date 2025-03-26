import express from 'express';
import { getAppUsers,deleteUser } from '../controller/appUser.controller.js';

const router = express.Router();

router.get('/getAppUsers', getAppUsers);
router.delete('/deleteUser/:userId', deleteUser);

export default router;