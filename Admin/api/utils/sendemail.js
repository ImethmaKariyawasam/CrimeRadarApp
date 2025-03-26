import nodemailer from "nodemailer";
import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GoogleSendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, template, data } = options;

  // Render HTML based on a template
  const templatePath = path.join(__dirname, "../mails", template);
  const html = await ejs.renderFile(templatePath, data);
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default GoogleSendMail;
