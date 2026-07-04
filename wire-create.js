const form = document.querySelector("#wireCreateForm");
const APP_VERSION = "20260703-wire-type-gates1";
const notes = document.querySelector("#wireNotes");
const locationInput = document.querySelector("#wireLocation");
const resultInput = document.querySelector("#wireResult");
const imageInput = document.querySelector("#wireImages");
const imagePreview = document.querySelector("#wireImagePreview");
const revisionInput = document.querySelector("#wireRevision");
const draftPreview = document.querySelector("#wireDraftPreview");
const statusEl = document.querySelector("#wireCreateStatus");
const reviseBtn = document.querySelector("#wireReviseBtn");
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

loadHeaderAccount();

function setWorking(isWorking, message = "") {
  form.dataset.working = isWorking ? "true" : "false";
  form.querySelectorAll("button, textarea, input").forEach((control) => {
    if (control === publishBtn || control === reviseBtn) return;
    control.disabled = isWorking;
  });
  reviseBtn.disabled = isWorking || !currentDraft;
  publishBtn.disabled = isWorking || !currentDraft;
  if (message) setStatus(message, isWorking ? "working" : "");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

const MAX_IMAGE_DIMENSION = 1800;
const IMAGE_QUALITY = 0.78;
const MAX_SOURCE_IMAGE_SIZE = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatBytes(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function imageUploadHelp(file, reason) {
  const name = file?.name || "Selected image";
  const type = file?.type || "unknown file type";
  const size = formatBytes(file?.size || 0);
  return `${name} could not be added. ${reason} File type: ${type}; size: ${size}. Try taking a screenshot of the image, exporting it as JPG/PNG, or choosing fewer/smaller photos.`;
}

function isHeicFile(file) {
  const extension = String(file.name || "").split(".").pop()?.toLowerCase();
  return ["heic", "heif"].includes(extension) || ["image/heic", "image/heif"].includes(file.type);
}

async function convertHeicToJpeg(file) {
  if (typeof window.heic2any !== "function") {
    throw new Error(imageUploadHelp(file, "HEIC conversion is not available yet. Refresh the page and try again."));
  }

  try {
    setStatus(`Converting HEIC to JPEG: ${file.name}`, "working");
    const converted = await window.heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: IMAGE_QUALITY,
    });
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
    if (!jpegBlob) throw new Error("Converter returned no image data.");
    const name = String(file.name || "image.heic").replace(/\.(heic|heif)$/i, ".jpg");
    return new File([jpegBlob], name, {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  } catch (error) {
    throw new Error(imageUploadHelp(file, `HEIC conversion failed: ${error.message || "unknown converter error"}`));
  }
}

function validateImageFile(file) {
  if (file.type && !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error(imageUploadHelp(file, "Only JPG, PNG, and WebP images are supported right now."));
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    throw new Error(imageUploadHelp(file, `This photo is too large to process on mobile. The current source limit is ${formatBytes(MAX_SOURCE_IMAGE_SIZE)}.`));
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("The compressed image could not be read back from the browser."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(imageUploadHelp(file, "The browser could not decode it as an image.")));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser could not compress this image."))), type, quality);
  });
}

async function prepareImage(file) {
  const sourceFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  validateImageFile(sourceFile);
  try {
    const image = await loadImage(sourceFile);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    if (!naturalWidth || !naturalHeight) {
      throw new Error(imageUploadHelp(file, "The browser loaded the file but could not read its dimensions."));
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(imageUploadHelp(sourceFile, "The browser could not create the image compressor."));
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", IMAGE_QUALITY);
    return {
      name: file.name,
      type: "image/jpeg",
      width,
      height,
      original_size: file.size,
      compressed_size: blob.size,
      data_url: await blobToDataUrl(blob),
      converted_from: isHeicFile(file) ? "heic" : "",
    };
  } catch (error) {
    if (String(error.message || "").includes(file.name)) throw error;
    throw new Error(imageUploadHelp(file, error.message || "The browser reported a generic image load error."));
  }
}

async function prepareImages(files) {
  const limitedFiles = [...files].slice(0, 6);
  const prepared = [];
  for (let index = 0; index < limitedFiles.length; index += 1) {
    setStatus(`Preparing image ${index + 1} of ${limitedFiles.length}: ${limitedFiles[index].name}`, "working");
    prepared.push(await prepareImage(limitedFiles[index]));
  }
  return prepared;
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
  const media = selectedImages
    .map(
      (image, index) => `
        <figure>
          <img src="${image.data_url}" alt="${escapeHtml(draftCaptionForImage(image, index))}" />
          <figcaption>${escapeHtml(draftCaptionForImage(image, index))}</figcaption>
        </figure>
      `,
    )
    .join("");

  draftPreview.innerHTML = `
    <p class="wire-label">${escapeHtml(draft.metadata?.kind || "Dispatch")}</p>
    <h3>${escapeHtml(draft.headline || "Untitled dispatch")}</h3>
    ${draft.dek ? `<p class="wire-dek">${escapeHtml(draft.dek)}</p>` : ""}
    ${draft.location ? `<p class="wire-byline">By ${escapeHtml(draft.byline || "808 Wire Staff")} · ${escapeHtml(draft.location)}</p>` : ""}
    ${media ? `<div class="wire-draft-media">${media}</div>` : ""}
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
        "The API returned an HTML page instead of JSON. Your Access session may be stale, or the upload may still be too large.",
      );
    }
    const message = data.error || text.slice(0, 180).trim() || `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

function draftCaptionForImage(image, index) {
  const caption = (currentDraft?.media_captions || []).find((item) => Number(item.index) === index)?.caption;
  return caption || image.name || `Wire image ${index + 1}`;
}

async function generateDraft({ revision = "" } = {}) {
  setWorking(true, revision ? "Revising draft with the desk..." : "Generating draft with the desk...");

  const { draft } = await postJson("/api/wire-drafts", {
    notes: notes.value,
    location: locationInput.value,
    result: resultInput.value,
    images: selectedImages,
    previousDraft: revision ? currentDraft : null,
    revision,
  });

  currentDraft = draft;
  renderDraft(draft);
  setWorking(false);
  setStatus(revision ? "Draft revised. Review before publishing." : "Draft generated. Review before publishing.", "success");
}

imageInput.addEventListener("change", async () => {
  setWorking(true, "Reading and compressing images...");
  try {
    selectedImages = await prepareImages(imageInput.files || []);
    renderImagePreview();
    if (!selectedImages.length) {
      setStatus("");
      return;
    }
    const originalSize = selectedImages.reduce((total, image) => total + (image.original_size || 0), 0);
    const compressedSize = selectedImages.reduce((total, image) => total + (image.compressed_size || 0), 0);
    const savings = originalSize ? Math.round((1 - compressedSize / originalSize) * 100) : 0;
    setStatus(
      `${selectedImages.length} image${selectedImages.length === 1 ? "" : "s"} ready. Compressed ${Math.max(0, savings)}%.`,
      "success",
    );
  } catch (error) {
    selectedImages = [];
    renderImagePreview();
    setStatus(error.message, "error");
  } finally {
    setWorking(false);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  currentDraft = null;
  try {
    await generateDraft();
  } catch (error) {
    setWorking(false);
    setStatus(error.message, "error");
  }
});

reviseBtn.addEventListener("click", async () => {
  if (!currentDraft) return;
  const revision = revisionInput.value.trim();
  if (!revision) {
    setStatus("Add revision notes first.", "error");
    revisionInput.focus();
    return;
  }
  try {
    await generateDraft({ revision });
  } catch (error) {
    setWorking(false);
    setStatus(error.message, "error");
  }
});

publishBtn.addEventListener("click", async () => {
  if (!currentDraft) return;
  setWorking(true, "Publishing draft and media...");

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
      media: selectedImages.map((image, index) => ({
        data_url: image.data_url,
        type: image.type,
        width: image.width,
        height: image.height,
        caption: draftCaptionForImage(image, index),
        sort_order: index,
      })),
    });
    setStatus("Published.", "success");
    window.location.href = "./index.html#wire";
  } catch (error) {
    setWorking(false);
    setStatus(error.message, "error");
  }
});
