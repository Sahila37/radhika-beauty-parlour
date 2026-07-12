const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { notifyNewBooking } = require("../services/notify");

const router = express.Router();

const VALID_SERVICES = [
  "Bridal Makeup",
  "Hair Cut & Styling",
  "Facial",
  "Manicure & Pedicure",
  "Threading",
  "Waxing",
  "Cleanup",
  "Mehendi",
  "Silver Package",
  "Gold Package",
  "Diamond Package",
  "Bridal Package",
];
const VALID_STATUSES = ["pending", "confirmed", "cancelled"];

// ---------- PUBLIC: create a booking ----------
router.post("/", (req, res) => {
  const { name, phone, service, date, time, message } = req.body;

  if (!name || !phone || !service || !date || !time) {
    return res.status(400).json({ error: "Name, phone, service, date and time are all required." });
  }
  if (!VALID_SERVICES.includes(service)) {
    return res.status(400).json({ error: "Please select a valid service." });
  }
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }

  const booking = {
    id: uuidv4(),
    name: String(name).trim().slice(0, 100),
    phone: digits.slice(-10),
    service,
    date,
    time,
    message: message ? String(message).trim().slice(0, 500) : "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.get("bookings").push(booking).write();

  // Fire-and-forget: don't make the customer wait on email/WhatsApp delivery,
  // and never fail their booking because a notification channel had an issue.
  notifyNewBooking(booking).catch((err) => console.error("Notification error:", err));

  res.status(201).json({ booking });
});

// ---------- ADMIN: list all bookings ----------
router.get("/", requireAdmin, (req, res) => {
  const bookings = db.get("bookings").value();
  res.json({ bookings });
});

// ---------- ADMIN: update booking status ----------
router.patch("/:id", requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  const booking = db.get("bookings").find({ id: req.params.id });
  if (!booking.value()) {
    return res.status(404).json({ error: "Booking not found." });
  }

  booking.assign({ status }).write();
  res.json({ booking: booking.value() });
});

// ---------- ADMIN: delete a booking ----------
router.delete("/:id", requireAdmin, (req, res) => {
  const exists = db.get("bookings").find({ id: req.params.id }).value();
  if (!exists) {
    return res.status(404).json({ error: "Booking not found." });
  }
  db.get("bookings").remove({ id: req.params.id }).write();
  res.json({ success: true });
});

module.exports = router;
