import express, { NextFunction, Request, Response } from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
  forgotPassword,
  updateAccessToken,
  getUserInfo,
  socialAuth,
  updateProfilePicture,
  updateUserDetails,
  updatePassword,
} from "../controllers/user.controller";
import { isAutheticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World");
});
userRouter.post("/register", registerUser);
userRouter.post("/activateUser", activateUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/logout-user", isAutheticated, logoutUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.get("/refreshtoken", updateAccessToken);
userRouter.get("/userinfo", isAutheticated, getUserInfo);
userRouter.put("/update-profile", isAutheticated, updateUserDetails);
userRouter.put("/update-password", isAutheticated, updatePassword);
userRouter.put("/update-user-avatar", isAutheticated, updateProfilePicture);
userRouter.post("/socialauth", socialAuth);
export default userRouter;
