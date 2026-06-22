import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (email, resetURL) => {
  await transporter.sendMail({
    from: `"BagsHub" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Reset Your BagsHub Password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#8B5E3C">BagsHub — Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetURL}" style="display:inline-block;background:#8B5E3C;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
