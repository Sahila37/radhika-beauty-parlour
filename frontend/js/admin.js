const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const bookingsList = document.getElementById("bookings-list");
const emptyMsg = document.getElementById("empty-msg");
const filterTabs = document.getElementById("filter-tabs");
const refreshBtn = document.getElementById("refresh-btn");

let currentFilter = "all";
let allBookings = [];

function getToken() { return localStorage.getItem("radhika_admin_token"); }
function setToken(t) { localStorage.setItem("radhika_admin_token", t); }
function clearToken() { localStorage.removeItem("radhika_admin_token"); }

function showDashboard() {
  loginView.style.display = "none";
  dashboardView.style.display = "block";
  logoutBtn.style.display = "inline-block";
  loadBookings();
}
function showLogin() {
  loginView.style.display = "block";
  dashboardView.style.display = "none";
  logoutBtn.style.display = "none";
}

// ---- LOGIN ----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const password = document.getElementById("password").value;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed.");
    setToken(data.token);
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

logoutBtn.addEventListener("click", () => {
  clearToken();
  showLogin();
});

// ---- LOAD BOOKINGS ----
async function loadBookings() {
  bookingsList.innerHTML = "<p style='color:var(--ivory-dim);'>Loading...</p>";
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 401 || res.status === 403) {
      clearToken();
      showLogin();
      return;
    }
    const data = await res.json();
    allBookings = data.bookings || [];
    renderBookings();
  } catch (err) {
    bookingsList.innerHTML = `<p style="color:#e08a8a;">Could not load bookings. Is the backend running?</p>`;
  }
}

function renderBookings() {
  const filtered = currentFilter === "all"
    ? allBookings
    : allBookings.filter(b => b.status === currentFilter);

  if (filtered.length === 0) {
    bookingsList.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  bookingsList.innerHTML = filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(b => `
      <div class="booking-card" data-id="${b.id}">
        <div class="info">
          <span class="status-badge status-${b.status}">${b.status}</span>
          <h4>${escapeHtml(b.name)} — ${escapeHtml(b.service)}</h4>
          <p>📞 ${escapeHtml(b.phone)}</p>
          <p>📅 ${escapeHtml(b.date)} at ${escapeHtml(b.time)}</p>
          ${b.message ? `<p>📝 ${escapeHtml(b.message)}</p>` : ""}
        </div>
        <div class="actions">
          ${b.status !== "confirmed" ? `<button class="confirm-btn" data-action="confirmed">Confirm</button>` : ""}
          ${b.status !== "cancelled" ? `<button class="cancel-btn" data-action="cancelled">Cancel</button>` : ""}
          <button class="delete-btn" data-action="delete">Delete</button>
        </div>
      </div>
    `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

bookingsList.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const card = e.target.closest(".booking-card");
  const id = card.dataset.id;
  const action = btn.dataset.action;

  try {
    if (action === "delete") {
      if (!confirm("Delete this booking permanently?")) return;
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } else {
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: action }),
      });
    }
    loadBookings();
  } catch (err) {
    alert("Action failed. Please try again.");
  }
});

filterTabs.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  [...filterTabs.children].forEach(b => b.classList.toggle("active", b === btn));
  renderBookings();
});

refreshBtn.addEventListener("click", loadBookings);

// ---- INIT ----
if (getToken()) showDashboard();
else showLogin();
