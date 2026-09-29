import "server-only";
import nodemailer from "nodemailer";

type InquiryMail = {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  country?: string | null;
  subject?: string | null;
  message: string;
  productName?: string | null;
};

export function mailEnabled(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sends a plain notification about a new inquiry. Never throws. */
export async function sendInquiryNotification(inquiry: InquiryMail, to: string | null | undefined) {
  const recipient = to || process.env.INQUIRY_NOTIFY_TO;
  if (!mailEnabled() || !recipient) return;

  const rows: Array<[string, string | null | undefined]> = [
    ["Name", inquiry.name],
    ["Company", inquiry.company],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Country", inquiry.country],
    ["Product", inquiry.productName],
    ["Subject", inquiry.subject],
  ];
  const text =
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n") + `\n\nMessage:\n${inquiry.message}\n\nInquiry ID: ${inquiry.id}`;
  const html =
    `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">` +
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(String(v))}</td></tr>`)
      .join("") +
    `</table><p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>` +
    `<p style="font-family:Arial,sans-serif;font-size:12px;color:#666">Inquiry ID: ${inquiry.id}</p>`;

  try {
    await transport().sendMail({
      from: process.env.SMTP_FROM ?? "EGF Website <no-reply@egyptgasfittings.com>",
      to: recipient,
      replyTo: inquiry.email,
      subject: `[EGF website] New inquiry from ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ""}`,
      text,
      html,
    });
  } catch (error) {
    console.error("Inquiry notification email failed:", error);
  }
}
