require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Safety checks on required env vars ----
if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
  console.error(
    "\n❌ Missing required environment variables.\n" +
    "Please copy .env.example to .env and set JWT_SECRET and ADMIN_PASSWORD.\n"
  );
  process.exit(1);
}

// ---- Middleware ----
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ---- Routes ----
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Radhika Beauty Parlour API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`✅ Radhika Beauty Parlour API running on http://localhost:${PORT}`);
});
