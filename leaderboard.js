const API_ENDPOINT = "/api/leaderboard";
const statusEl = document.querySelector("#leaderboardStatus");
const summaryEl = document.querySelector("#dayOneSummary");
const cardsEl = document.querySelector("#dayOneCards");
const refreshBtn = document.querySelector("#refreshLeaderboardBtn");

let state = null;

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
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

function scoresForPlayer(memberId) {
  return (state?.scores || []).filter((score) => score.member_id === memberId);
}

function scoreForHole(memberId, holeNumber) {
  return scoresForPlayer(memberId).find((score) => score.hole_number === holeNumber)?.strokes || "";
}

function playerTotal(memberId) {
  return scoresForPlayer(memberId).reduce((sum, score) => sum + Number(score.strokes || 0), 0);
}

function holesComplete(memberId) {
  return new Set(scoresForPlayer(memberId).map((score) => score.hole_number)).size;
}

function toPar(memberId) {
  const total = playerTotal(memberId);
  if (!total) return "";
  const playedPar = state.card.par.slice(0, holesComplete(memberId)).reduce((sum, par) => sum + par, 0);
  const diff = total - playedPar;
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : String(diff);
}

function standings() {
  return [...(state?.players || [])]
    .map((player) => ({
      ...player,
      total: playerTotal(player.member_id),
      holes: holesComplete(player.member_id),
      toPar: toPar(player.member_id),
    }))
    .sort((a, b) => {
      if (!a.total && !b.total) return a.sort_order - b.sort_order;
      if (!a.total) return 1;
      if (!b.total) return -1;
      return a.total - b.total || b.holes - a.holes || a.sort_order - b.sort_order;
    });
}

function renderHeaderAccount() {
  const member = state?.member || {};
  document.querySelectorAll(".account-link").forEach((link) => {
    const image = link.querySelector("img");
    const label = link.querySelector("span");
    if (image) image.src = member.avatar_url || "./assets/favicon.svg";
    if (label) label.textContent = member.display_name || "Profile";
  });
  document.querySelectorAll(".admin-link").forEach((link) => {
    link.classList.toggle("visible", ["owner", "admin"].includes(member.role));
  });
}

function renderSummary() {
  const card = state.card;
  const rows = standings();
  summaryEl.innerHTML = `
    <article class="leaderboard-course">
      <span>${escapeHtml(card.course)}</span>
      <strong>${escapeHtml(state.round?.name || card.round_name)}</strong>
      <small>Par ${card.par.reduce((sum, par) => sum + par, 0)} · Back ${card.tees.back.reduce((sum, yards) => sum + yards, 0)} · Middle ${card.tees.middle.reduce((sum, yards) => sum + yards, 0)} · Forward ${card.tees.forward.reduce((sum, yards) => sum + yards, 0)}</small>
    </article>
    <div class="leaderboard-table">
      ${rows
        .map(
          (player, index) => `
            <div class="leaderboard-table-row">
              <span>${index + 1}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <b>${player.total || "-"}</b>
              <small>${player.toPar || "-"} · ${player.holes}/9</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderScoreInputs(player) {
  return state.card.par
    .map((_, index) => {
      const hole = index + 1;
      return `
        <label>
          <span>${hole}</span>
          <input data-score-input data-member-id="${player.member_id}" data-hole="${hole}" type="number" inputmode="numeric" min="1" max="20" value="${scoreForHole(player.member_id, hole)}" />
        </label>
      `;
    })
    .join("");
}

function renderCards() {
  const card = state.card;
  cardsEl.innerHTML = (state.players || [])
    .map(
      (player) => `
        <article class="player-scorecard">
          <div class="player-scorecard-head">
            <div>
              <span>Day 1 Scorecard</span>
              <strong>${escapeHtml(player.name)}</strong>
            </div>
            <b>${playerTotal(player.member_id) || "-"}</b>
          </div>
          <div class="scorecard-grid scorecard-meta" aria-hidden="true">
            <span>Hole</span>
            ${card.par.map((_, index) => `<span>${index + 1}</span>`).join("")}
            <span>Par</span>
            ${card.par.map((par) => `<span>${par}</span>`).join("")}
            <span>Middle</span>
            ${card.tees.middle.map((yards) => `<span>${yards}</span>`).join("")}
            <span>HCP</span>
            ${card.handicap.map((hcp) => `<span>${hcp}</span>`).join("")}
          </div>
          <div class="scorecard-input-grid">
            <span>Score</span>
            ${renderScoreInputs(player)}
          </div>
        </article>
      `,
    )
    .join("");
}

function render() {
  renderHeaderAccount();
  renderSummary();
  renderCards();
}

async function loadLeaderboard(message = "Loading leaderboard...") {
  setStatus(message, "working");
  state = await requestJson(API_ENDPOINT);
  render();
  setStatus("Leaderboard loaded.", "success");
}

async function saveScore(input) {
  setStatus("Saving score...", "working");
  state = await requestJson(API_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify({
      round_id: state.round.id,
      member_id: input.dataset.memberId,
      hole_number: Number(input.dataset.hole),
      strokes: Number(input.value),
    }),
  });
  render();
  setStatus("Saved.", "success");
}

cardsEl.addEventListener("change", (event) => {
  const input = event.target.closest("[data-score-input]");
  if (!input || !input.value) return;
  saveScore(input).catch((error) => setStatus(error.message, "error"));
});

refreshBtn.addEventListener("click", () => {
  loadLeaderboard("Refreshing...").catch((error) => setStatus(error.message, "error"));
});

loadLeaderboard().catch((error) => setStatus(error.message, "error"));
