const form = document.querySelector("#adminContentForm");
const statusEl = document.querySelector("#adminStatus");
const coursesEl = document.querySelector("#adminCourses");
const eventsEl = document.querySelector("#adminEvents");
const addCourseBtn = document.querySelector("#addCourseBtn");
const addEventBtn = document.querySelector("#addEventBtn");
const APP_VERSION = "20260714-live-scoring1";

let adminLoaded = false;
let courses = [];
let events = [];

async function ensureFreshAppVersion() {
  try {
    const response = await fetch(`./site-version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const latest = String(data.version || "").trim();
    if (!latest || latest === APP_VERSION) return;
    const reloadKey = `808-classic-reloaded-${latest}`;
    if (sessionStorage.getItem(reloadKey)) return;
    sessionStorage.setItem(reloadKey, "true");
    const url = new URL(window.location.href);
    url.searchParams.set("v", latest);
    window.location.replace(url.toString());
  } catch (error) {
    console.warn("Version check failed.", error);
  }
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function setWorking(isWorking, message = "") {
  form.dataset.working = isWorking ? "true" : "false";
  form.querySelectorAll("button, input, textarea").forEach((control) => {
    control.disabled = isWorking;
  });
  if (message) setStatus(message, isWorking ? "working" : "");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
    ...options,
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json().catch(() => ({})) : {};
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function field(name, value = "", type = "text") {
  return `<input name="${name}" type="${type}" value="${escapeHtml(value)}" />`;
}

function textField(name, value = "", rows = 3) {
  return `<textarea name="${name}" rows="${rows}">${escapeHtml(value)}</textarea>`;
}

function checkbox(name, checked = true) {
  return `<label class="admin-check"><input name="${name}" type="checkbox" ${checked ? "checked" : ""} /> Active</label>`;
}

function renderCourse(course = {}, index = 0) {
  return `
    <article class="admin-card" data-kind="course" data-index="${index}">
      ${field("id", course.id || "", "hidden")}
      ${field("course_id", course.course_id || "", "hidden")}
      <div class="admin-card-head">
        <strong>${escapeHtml(course.day_label || `Course ${index + 1}`)}</strong>
        ${checkbox("active", course.active !== false)}
      </div>
      <div class="admin-grid">
        <label>Day ${field("day_label", course.day_label)}</label>
        <label>Course name ${field("name", course.name)}</label>
        <label>Status ${field("booking_status", course.booking_status)}</label>
        <label>Tee times / notes ${field("tee_time_notes", course.tee_time_notes)}</label>
        <label>Phone ${field("phone", course.phone)}</label>
        <label>Sort order ${field("sort_order", course.sort_order ?? index + 1, "number")}</label>
      </div>
      <label>Address ${field("address", course.address)}</label>
      <label>Image URL ${field("image_url", course.image_url)}</label>
      <label>Website URL ${field("website_url", course.website_url)}</label>
      <label>Map URL ${field("map_url", course.map_url)}</label>
      <label>Description ${textField("description", course.description, 4)}</label>
    </article>
  `;
}

function renderEvent(event = {}, index = 0) {
  return `
    <article class="admin-card" data-kind="event" data-index="${index}">
      ${field("id", event.id || "", "hidden")}
      <div class="admin-card-head">
        <strong>${escapeHtml(event.title || `Event ${index + 1}`)}</strong>
        ${checkbox("active", event.active !== false)}
      </div>
      <div class="admin-grid">
        <label>Date ${field("date_label", event.date_label)}</label>
        <label>Title ${field("title", event.title)}</label>
        <label>Time ${field("time_label", event.time_label)}</label>
        <label>Place ${field("place", event.place)}</label>
        <label>Sort order ${field("sort_order", event.sort_order ?? index + 1, "number")}</label>
        <label>Link label ${field("link_label", event.link_label)}</label>
      </div>
      <label>Address ${field("address", event.address)}</label>
      <label>Link URL ${field("link_url", event.link_url)}</label>
      <label>Blurb ${textField("blurb", event.blurb, 4)}</label>
    </article>
  `;
}

function renderAdmin() {
  coursesEl.innerHTML = courses.map(renderCourse).join("");
  eventsEl.innerHTML = events.map(renderEvent).join("");
}

function rowData(card) {
  const data = new FormData();
  card.querySelectorAll("input, textarea").forEach((fieldEl) => {
    if (fieldEl.type === "checkbox") {
      data.set(fieldEl.name, fieldEl.checked ? "true" : "false");
    } else {
      data.set(fieldEl.name, fieldEl.value);
    }
  });
  return Object.fromEntries(data.entries());
}

function payload() {
  return {
    courses: [...document.querySelectorAll('[data-kind="course"]')].map(rowData),
    events: [...document.querySelectorAll('[data-kind="event"]')].map(rowData),
  };
}

async function loadAdmin() {
  adminLoaded = false;
  setWorking(true, "Loading admin content...");
  const data = await requestJson("/api/admin-content");
  courses = data.courses || [];
  events = data.events || [];
  renderAdmin();
  adminLoaded = true;
  setWorking(false);
  setStatus("Admin content loaded.", "success");
}

function renderAccountLink(member = null) {
  const name = member?.display_name || "Profile";
  const photo = member?.avatar_url || "./assets/favicon.svg";
  const isAdmin = ["owner", "admin"].includes(member?.role);
  document.querySelectorAll(".account-link").forEach((link) => {
    const image = link.querySelector("img");
    const label = link.querySelector("span");
    if (image) image.src = photo;
    if (label) label.textContent = name;
    link.setAttribute("aria-label", `Edit profile${member?.display_name ? ` for ${member.display_name}` : ""}`);
  });
  document.querySelectorAll(".admin-link").forEach((link) => {
    link.classList.toggle("visible", isAdmin);
  });
}

async function loadHeaderAccount() {
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    renderAccountLink(data.member || null);
  } catch (error) {
    console.warn("Header account could not be loaded.", error);
  }
}

addCourseBtn.addEventListener("click", () => {
  courses.push({ day_label: "New Day", active: true, sort_order: courses.length + 1 });
  renderAdmin();
});

addEventBtn.addEventListener("click", () => {
  events.push({ date_label: "TBD", title: "New Event", active: true, sort_order: events.length + 1 });
  renderAdmin();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!adminLoaded) {
    setStatus("Admin content did not finish loading, so nothing was saved. Refresh and try again.", "error");
    return;
  }

  setWorking(true, "Saving admin content...");
  try {
    const data = await requestJson("/api/admin-content", {
      method: "PATCH",
      body: JSON.stringify(payload()),
    });
    courses = data.courses || [];
    events = data.events || [];
    renderAdmin();
    setWorking(false);
    setStatus("Saved. The public site will update on refresh.", "success");
  } catch (error) {
    setWorking(false);
    setStatus(error.message, "error");
  }
});

ensureFreshAppVersion().then(() => {
  loadHeaderAccount();
  loadAdmin().catch((error) => {
    setWorking(false);
    adminLoaded = false;
    setStatus(`${error.message}.`, "error");
  });
});
