const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  // Guard: catch missing env vars early with a clear message
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in your .env file."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;