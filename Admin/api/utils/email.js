import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text,html}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "crimeradar@outlook.com",
      pass: "n*yFAn9KSj*?@K$",
    },
  });

  const mailOptions = {
    from: "crimeradar@outlook.com",
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
};
