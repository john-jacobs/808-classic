const form = document.querySelector("#wireCreateForm");
const APP_VERSION = "20260618-wirecreate-authfix1";
const notes = document.querySelector("#wireNotes");
const locationInput = document.querySelector("#wireLocation");
const resultInput = document.querySelector("#wireResult");
const imageInput = document.querySelector("#wireImages");
const imagePreview = document.querySelector("#wireImagePreview");
const draftPreview = document.querySelector("#wireDraftPreview");
const statusEl = document.querySelector("#wireCreateStatus");
const publishBtn = document.querySelector("#wirePublishBtn");

let selectedImages = [];
let currentDraft = null;

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

ensureFreshAppVersion();

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Image could not be read"));
    reader.readAsDataURL(file);
  });
}

async function prepareImages(files) {
  return Promise.all(
    [...files].slice(0, 6).map(async (file) => ({
      name: file.name,
      type: file.type,
      data_url: await fileToDataUrl(file),
    })),
  );
}

function renderImagePreview() {
  imagePreview.innerHTML = selectedImages
    .map(
      (image) => `
        <figure>
          <img src="${image.data_url}" alt="" />
          <figcaption>${escapeHtml(image.name)}</figcaption>
        </figure>
      `,
    )
    .join("");
}

function renderDraft(draft) {
  const paragraphs = String(draft.body || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  draftPreview.innerHTML = `
    <p class="wire-label">${escapeHtml(draft.metadata?.kind || "Dispatch")}</p>
    <h3>${escapeHtml(draft.headline || "Untitled dispatch")}</h3>
    ${draft.dek ? `<p class="wire-dek">${escapeHtml(draft.dek)}</p>` : ""}
    ${draft.location ? `<p class="wire-byline">By ${escapeHtml(draft.byline || "808 Wire Staff")} · ${escapeHtml(draft.location)}</p>` : ""}
    <div class="wire-copy">
      ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>
  `;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json().catch(() => ({})) : {};
  const text = contentType.includes("application/json") ? "" : await response.text().catch(() => "");
  if (!response.ok) {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const accessRedirect = response.redirected || response.url.includes("cloudflareaccess.com");
    const gotHtml = contentType.includes("text/html") || text.trim().startsWith("<!DOCTYPE html");
    if (isLocal) {
      throw new Error(
        "Local static preview cannot run Cloudflare API functions. Use https://808classic.com/wire-create.html or run a Pages dev server.",
      );
    }
    if (accessRedirect) {
      throw new Error("Your Cloudflare Access session expired or is missing. Re-open 808classic.com, log in, then try again.");
    }
    if (gotHtml) {
      throw new Error(
        "The API returned an HTML page instead of JSON. Check that the Cloudflare Function is deployed and that your Access session is active.",
      );
    }
    const message = data.error || text.slice(0, 180).trim() || `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

imageInput.addEventListener("change", async () => {
  setStatus("Reading images...");
  selectedImages = await prepareImages(imageInput.files || []);
  renderImagePreview();
  setStatus(selectedImages.length ? `${selectedImages.length} image${selectedImages.length === 1 ? "" : "s"} ready.` : "");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  publishBtn.disabled = true;
  currentDraft = null;
  setStatus("Generating draft...");

  try {
    const { draft } = await postJson("/api/wire-drafts", {
      notes: notes.value,
      location: locationInput.value,
      result: resultInput.value,
      images: selectedImages,
    });
    currentDraft = draft;
    renderDraft(draft);
    publishBtn.disabled = false;
    setStatus("Draft generated.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

publishBtn.addEventListener("click", async () => {
  if (!currentDraft) return;
  publishBtn.disabled = true;
  setStatus("Publishing draft...");

  try {
    await postJson("/api/posts", {
      type: "dispatch",
      headline: currentDraft.headline,
      dek: currentDraft.dek,
      byline: currentDraft.byline,
      location: currentDraft.location,
      published_at: currentDraft.published_at,
      body: currentDraft.body,
      metadata: currentDraft.metadata || {},
    });
    setStatus("Published.", "success");
    window.location.href = "./index.html#wire";
  } catch (error) {
    publishBtn.disabled = false;
    setStatus(error.message, "error");
  }
});
