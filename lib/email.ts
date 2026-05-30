import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

export function getReminderEmailConfig() {
  const to = process.env.REMINDER_EMAIL;
  const from =
    process.env.EMAIL_FROM ?? "LeadFlow <olivebishop.com>";

  if (!to) {
    throw new Error("REMINDER_EMAIL is not configured");
  }

  return { to, from };
}
