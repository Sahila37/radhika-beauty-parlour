// ===================== DATA =====================
const SERVICES = [
  { name: "Bridal Makeup", desc: "Full bridal look, trial included.", icon: "flower" },
  { name: "Hair Cut & Styling", desc: "Cuts, blow-dry & styling.", icon: "hair" },
  { name: "Facial", desc: "Deep-cleanse & glow facials.", icon: "lotus" },
  { name: "Manicure & Pedicure", desc: "Hands & feet, fully pampered.", icon: "hand" },
  { name: "Threading", desc: "Precise brow & face threading.", icon: "brow" },
  { name: "Waxing", desc: "Smooth, gentle waxing.", icon: "wax" },
  { name: "Cleanup", desc: "Quick refresh for everyday glow.", icon: "sparkle" },
  { name: "Mehendi", desc: "Traditional & bridal mehendi art.", icon: "mehendi" },
];

const ICONS = {
  flower: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="2.4"/><path d="M12 2c1.5 2 1.5 4-0 6-1.5-2-1.5-4 0-6zM12 22c1.5-2 1.5-4 0-6-1.5 2-1.5 4 0 6zM2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zM22 12c-2-1.5-4-1.5-6 0 2 1.5 4 1.5 6 0z"/></svg>`,
  hair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4c4 0 4 6 8 6s4-6 8-6M6 10c3 0 3 5 6 5s3-5 6-5M8 16c2 0 2 4 4 4s2-4 4-4"/></svg>`,
  lotus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 20c-4-2-6-6-6-10 3 0 5 2 6 5 1-3 3-5 6-5 0 4-2 8-6 10z"/><path d="M12 20V9"/></svg>`,
  hand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 12V5a1.5 1.5 0 013 0v5M11 10V4a1.5 1.5 0 013 0v6M14 10V6a1.5 1.5 0 013 0v6M17 12V9a1.5 1.5 0 013 0v6a7 7 0 01-7 7h-1a7 7 0 01-6-3.5L4 17"/></svg>`,
  brow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10c3-4 8-5 11-2M6 14c2 1 5 1 7-1M14 10c2-2 5-2 7 1"/></svg>`,
  wax: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="8" y="3" width="8" height="6" rx="1"/><path d="M9 9v10a3 3 0 006 0V9"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>`,
  mehendi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21s-6-4.35-6-9a6 6 0 0112 0c0 4.65-6 9-6 9z"/><circle cx="12" cy="11" r="1.6"/></svg>`,
};

// ===================== RENDER SERVICES =====================
const servicesGrid = document.getElementById("services-grid");
servicesGrid.innerHTML = SERVICES.map(s => `
  <div class="service-card">
    <div class="service-icon">${ICONS[s.icon]}</div>
    <h3>${s.name}</h3>
    <p>${s.desc}</p>
  </div>
`).join("");

// ===================== RENDER GALLERY (placeholders) =====================
const galleryGrid = document.getElementById("gallery-grid");
galleryGrid.innerHTML = SERVICES.map(s => `
  <div class="gallery-item">
    ${ICONS[s.icon]}
    <span>${s.name}</span>
  </div>
`).join("");

// ===================== PACKAGE BUTTONS -> PREFILL BOOKING FORM =====================
document.querySelectorAll(".package-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const packageName = btn.dataset.package;
    const serviceSelect = document.getElementById("service");
    serviceSelect.value = packageName;
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    document.getElementById("name").focus({ preventScroll: true });
  });
});

// ===================== NAV TOGGLE (mobile) =====================
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.style.display === "flex";
  navLinks.style.display = isOpen ? "none" : "flex";
  navLinks.style.flexDirection = "column";
  navLinks.style.position = "absolute";
  navLinks.style.top = "100%";
  navLinks.style.left = "0";
  navLinks.style.right = "0";
  navLinks.style.background = "rgba(10,9,8,0.98)";
  navLinks.style.padding = "1.2rem 6vw";
  navLinks.style.gap = "1rem";
  navLinks.style.borderBottom = "1px solid var(--border)";
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  if (window.innerWidth <= 920) navLinks.style.display = "none";
}));

// ===================== FOOTER YEAR =====================
document.getElementById("year").textContent = new Date().getFullYear();

// ===================== BOOKING FORM SUBMIT =====================
const form = document.getElementById("booking-form");
const statusEl = document.getElementById("booking-status");
const submitBtn = document.getElementById("booking-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "";
  statusEl.textContent = "";

  const payload = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    service: document.getElementById("service").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    message: document.getElementById("message").value.trim(),
  };

  if (!/^\d{10}$/.test(payload.phone.replace(/\D/g, "").slice(-10))) {
    statusEl.textContent = "Please enter a valid 10-digit phone number.";
    statusEl.className = "err";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Booking...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");

    statusEl.textContent = "Thank you! Your appointment request has been received — we'll call you to confirm.";
    statusEl.className = "ok";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Couldn't submit right now. Please call us at 8584002559, or try again in a moment.";
    statusEl.className = "err";
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Booking";
  }
});

// ===================== NAV BG ON SCROLL =====================
const siteNav = document.getElementById("site-nav");
window.addEventListener("scroll", () => {
  siteNav.style.background = window.scrollY > 40 ? "rgba(10,9,8,0.97)" : "rgba(10,9,8,0.85)";
});
