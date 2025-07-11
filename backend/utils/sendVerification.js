// utils/verifyEmail.js
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
    text: options.message.replace(/<[^>]*>/g, ""),
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
