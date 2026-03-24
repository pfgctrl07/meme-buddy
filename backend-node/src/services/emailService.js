import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let cachedTransport = null;

export function isEmailConfigured() {
  return Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFrom);
}

function getTransport() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP is not configured");
  }

  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: Number(env.smtpPort),
      secure: Number(env.smtpPort) === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return cachedTransport;
}

export async function sendAlertEmail({ to, subject, text, html }) {
  const transport = getTransport();

  return transport.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
  });
}
