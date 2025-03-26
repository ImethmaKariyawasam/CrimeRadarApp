import NoticeBoard from "../models/notice.model.js";
import UserModel from "../models/user.model.js";
import { sendEmail } from "../utils/email.js";

export const getAppUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find();
    const totalUsers = users.length;
    const verifiedUsers = users.filter(
      (user) => user.isVerified === true
    ).length;
    const unverifiedUsers = users.filter(
      (user) => user.isVerified === false
    ).length;
    res.status(200).json({ users, totalUsers, verifiedUsers, unverifiedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    await UserModel.findByIdAndDelete(req.params.userId);
    await NoticeBoard.deleteMany({ userId: req.params.userId });
    res.status(200).json({ message: "Account deleted successfully" });
    try {
      await sendEmail({
        to: user.email,
        subject: "Account Deletion Notification",
        html: ` 
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your account has been permanently deleted from our system. If you believe this was a mistake, please contact us immediately.</p>
          <blockquote style="background-color: #f2f2f2; border-left: 5px solid #e74c3c; padding: 10px 20px; margin: 0; font-family: Arial, sans-serif; font-size: 16px;">
            <p style="margin: 0;">Account: ${user.email}</p>
          </blockquote>
          <p>For any inquiries, please contact us at <strong>0758 123 456</strong></p>
          <p>Best regards,<br>Crime Radar Team</p>
          <p>This is an auto-generated email. Please do not reply to this email.</p>
        `,
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    next(error);
  }
};
