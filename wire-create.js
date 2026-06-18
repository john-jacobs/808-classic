const form = document.querySelector("#wireCreateForm");
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
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
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
