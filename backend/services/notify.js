// Sends you an instant alert whenever a new booking comes in.
// Both channels are optional and independent — if one isn't configured
// (or fails), the other still runs, and the booking is never blocked
// by a notification failure.

const nodemailer = require("nodemailer");
const twilio = require("twilio");

// ---------- EMAIL (Gmail SMTP via Nodemailer) ----------
let mailer = null;
function getMailer() {
  if (mailer) return mailer;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail "App Password", not your normal password
    },
  });
  return mailer;
}

async function sendEmailAlert(booking) {
  const transporter = getMailer();
  if (!transporter) return; // not configured, skip silently

  const to = process.env.EMAIL_TO || process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"Radhika Beauty Parlour Website" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New booking: ${booking.name} — ${booking.service}`,
    text:
      `You have a new booking request.\n\n` +
      `Name: ${booking.name}\n` +
      `Phone: ${booking.phone}\n` +
      `Service: ${booking.service}\n` +
      `Date: ${booking.date}\n` +
      `Time: ${booking.time}\n` +
      `Notes: ${booking.message || "—"}\n\n` +
      `Log in to the admin dashboard to confirm or cancel it.`,
  });
}

// ---------- WHATSAPP / SMS (Twilio) ----------
let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;

  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return twilioClient;
}

async function sendWhatsAppAlert(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM || !process.env.OWNER_WHATSAPP_TO) return;

  const body =
    `New booking!\n` +
    `${booking.name} (${booking.phone})\n` +
    `${booking.service} on ${booking.date} at ${booking.time}` +
    (booking.message ? `\nNote: ${booking.message}` : "");

  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${process.env.OWNER_WHATSAPP_TO}`,
    body,
  });
}

async function sendSmsAlert(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_SMS_FROM || !process.env.OWNER_SMS_TO) return;

  const body =
    `New booking: ${booking.name} (${booking.phone}) — ${booking.service} ` +
    `on ${booking.date} at ${booking.time}.`;

  await client.messages.create({
    from: process.env.TWILIO_SMS_FROM,
    to: process.env.OWNER_SMS_TO,
    body,
  });
}

// ---------- Public entry point ----------
// Fires all configured channels in parallel; logs failures but never throws,
// so a notification problem never stops a booking from being saved.
async function notifyNewBooking(booking) {
  const results = await Promise.allSettled([
    sendEmailAlert(booking),
    sendWhatsAppAlert(booking),
    sendSmsAlert(booking),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const channel = ["email", "whatsapp", "sms"][i];
      console.error(`⚠️  ${channel} notification failed:`, r.reason.message || r.reason);
    }
  });
}

module.exports = { notifyNewBooking };
