import nodemailer from "nodemailer";

/**
 * Mailtrap sandbox transport. Messages are captured in the Mailtrap inbox
 * rather than delivered, which is what we want for demo + evaluation.
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT ?? 2525),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const FROM = process.env.MAIL_FROM || "Fan Hub Plus <no-reply@fanhubplus.app>";
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5210";

function layout(heading, body, cta) {
  return `
  <div style="background:#0b0a12;padding:40px 0;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#15131f;border:1px solid #272235;border-radius:18px;padding:36px 34px;color:#efecf6">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#ff3366">Fan Hub Plus</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#ffffff">${heading}</h1>
      <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#b3aac4">${body}</p>
      <a href="${cta.href}" style="display:inline-block;background:#ff3366;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px">${cta.label}</a>
      <p style="margin:26px 0 0;font-size:12.5px;line-height:1.6;color:#6f667f">
        If the button doesn't work, paste this link into your browser:<br>
        <span style="color:#8f86a3;word-break:break-all">${cta.href}</span>
      </p>
      <p style="margin:18px 0 0;font-size:12.5px;color:#6f667f">This link expires in 1 hour and can be used once.</p>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to, name, token) {
  const href = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Confirm your Fan Hub Plus account",
    html: layout(
      `Welcome, ${name}`,
      "Confirm your email address to unlock bookmarks, your personalised dashboard, and fan submissions.",
      { href, label: "Confirm email" },
    ),
  });
}

export async function sendPasswordResetEmail(to, name, token) {
  const href = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your Fan Hub Plus password",
    html: layout(
      `Hi ${name}`,
      "We received a request to reset your password. If that wasn't you, ignore this email and nothing will change.",
      { href, label: "Choose a new password" },
    ),
  });
}
