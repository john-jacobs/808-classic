const form = document.querySelector("#settingsForm");
const statusEl = document.querySelector("#settingsStatus");
const photoInput = document.querySelector("#profilePhotoInput");
const photoPreview = document.querySelector("#profilePhotoPreview");
const photoThumb = document.querySelector("#profilePhotoThumb");
const photoName = document.querySelector("#settingsPhotoName");
const APP_VERSION = "20260620-heic-upload1";
let pendingPhotoDataUrl = "";

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
  form.querySelectorAll("button, input, select, textarea").forEach((control) => {
    control.disabled = isWorking;
  });
  if (message) setStatus(message, isWorking ? "working" : "");
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

function setValue(name, value) {
  const field = form.elements.namedItem(name);
  if (!field) return;
  field.value = value ?? "";
}

function profilePhoto(profile = {}, member = {}) {
  return profile.headshot_url || member.avatar_url || "./assets/favicon.svg";
}

function setPhoto(src, name = "") {
  const photoSrc = src || "./assets/favicon.svg";
  photoPreview.src = photoSrc;
  photoThumb.src = photoSrc;
  photoName.textContent = name || "808 Member";
}

function fillForm(data) {
  const profile = data.profile || {};
  const trip = data.trip_profile || {};
  setValue("display_name", profile.display_name || data.member?.display_name);
  setValue("title", profile.title);
  setValue("city", profile.city);
  setValue("height", profile.height);
  setValue("bio", profile.bio);
  setValue("quote", profile.quote);
  setValue("strength", profile.strength);
  setValue("weakness", profile.weakness);
  setValue("attendance_status", trip.attendance_status || "confirmed");
  setValue("handicap", trip.handicap);
  setValue("arrival", trip.arrival);
  setValue("departure", trip.departure);
  setValue("classic_record", trip.classic_record);
  setValue("detail", trip.detail);
  setPhoto(profilePhoto(profile, data.member), profile.display_name || data.member?.display_name);
}

function formPayload() {
  const data = new FormData(form);
  return {
    display_name: data.get("display_name"),
    title: data.get("title"),
    city: data.get("city"),
    height: data.get("height"),
    bio: data.get("bio"),
    quote: data.get("quote"),
    strength: data.get("strength"),
    weakness: data.get("weakness"),
    attendance_status: data.get("attendance_status"),
    handicap: data.get("handicap"),
    arrival: data.get("arrival"),
    departure: data.get("departure"),
    classic_record: data.get("classic_record"),
    detail: data.get("detail"),
    headshot_data_url: pendingPhotoDataUrl,
  };
}

async function loadSettings() {
  setWorking(true, "Loading settings...");
  const data = await requestJson("/api/settings");
  fillForm(data);
  setWorking(false);
  setStatus("Settings loaded.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setWorking(true, "Saving settings...");
  try {
    const data = await requestJson("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(formPayload()),
    });
    pendingPhotoDataUrl = "";
    photoInput.value = "";
    fillForm(data);
    setWorking(false);
    setStatus("Saved. The field will update on refresh.", "success");
  } catch (error) {
    setWorking(false);
    setStatus(error.message, "error");
  }
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  pendingPhotoDataUrl = "";
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    photoInput.value = "";
    setStatus("Profile photo must be a JPG, PNG, or WebP image.", "error");
    return;
  }
  if (file.size > 3_400_000) {
    photoInput.value = "";
    setStatus("Profile photo must be under 3.4 MB.", "error");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    pendingPhotoDataUrl = String(reader.result || "");
    setPhoto(pendingPhotoDataUrl, form.elements.namedItem("display_name")?.value || photoName.textContent);
    setStatus("Profile photo ready. Save settings to publish it.", "");
  });
  reader.addEventListener("error", () => {
    photoInput.value = "";
    setStatus("Could not read that image.", "error");
  });
  reader.readAsDataURL(file);
});

ensureFreshAppVersion().then(() => {
  loadSettings().catch((error) => {
    setWorking(false);
    setStatus(error.message, "error");
  });
});
