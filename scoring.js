const API_ENDPOINT = "/api/live-scoring";
const statusEl = document.querySelector("#scoringStatus");
const leaderboardEl = document.querySelector("#scoringLeaderboard");
const roundTabsEl = document.querySelector("#roundTabs");
const scoreEntryEl = document.querySelector("#scoreEntry");
const scoreEntryMetaEl = document.querySelector("#scoreEntryMeta");
const drinkCardsEl = document.querySelector("#drinkCards");
const setupPanel = document.querySelector("#setupPanel");
const pointsInput = document.querySelector("#pointsInput");
const drinkAllotmentInput = document.querySelector("#drinkAllotmentInput");
const roundSetupEl = document.querySelector("#roundSetup");
const teamSetupEl = document.querySelector("#teamSetup");
const saveSetupBtn = document.querySelector("#saveSetupBtn");
const refreshBtn = document.querySelector("#refreshScoringBtn");

let state = null;
let selectedRoundId = "";

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

function playerById(memberId) {
  return (state?.players || []).find((player) => player.member_id === memberId);
}

function roundById(roundId) {
  return (state?.rounds || []).find((round) => round.id === roundId);
}

function scoresForRound(roundId, memberId) {
  return (state?.individual_scores || []).filter((score) => score.round_id === roundId && score.member_id === memberId);
}

function teamScoresForRound(roundId, teamId) {
  return (state?.team_scores || []).filter((score) => score.round_id === roundId && score.team_id === teamId);
}

function scoreTotal(scores = []) {
  return scores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
}

function completed(scores = [], holes = 18) {
  return new Set(scores.map((score) => score.hole_number)).size >= holes;
}

function roundTeams(roundId) {
  return (state?.teams || [])
    .filter((team) => team.round_id === roundId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));
}

function teamMemberIds(teamId) {
  return (state?.team_members || []).filter((row) => row.team_id === teamId).map((row) => row.member_id);
}

function positionPoints(position) {
  return Number(state?.scoring?.points_by_position?.[position - 1] || 0);
}

function rankRows(rows = []) {
  const sorted = [...rows].sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
  let lastTotal = null;
  let rank = 0;
  return sorted.map((row, index) => {
    if (row.total !== lastTotal) rank = index + 1;
    lastTotal = row.total;
    return { ...row, rank, points: positionPoints(rank) };
  });
}

function roundResults(round) {
  if (round.format === "scramble") {
    return rankRows(
      roundTeams(round.id)
        .map((team) => {
          const scores = teamScoresForRound(round.id, team.id);
          return {
            id: team.id,
            kind: "team",
            name: team.name,
            total: scoreTotal(scores),
            complete: completed(scores, round.holes),
            memberIds: teamMemberIds(team.id),
          };
        })
        .filter((row) => row.total > 0),
    );
  }

  return rankRows(
    (state?.players || [])
      .map((player) => {
        const scores = scoresForRound(round.id, player.member_id);
        return {
          id: player.member_id,
          kind: "player",
          name: player.name,
          total: scoreTotal(scores),
          complete: completed(scores, round.holes),
          memberIds: [player.member_id],
        };
      })
      .filter((row) => row.total > 0),
  );
}

function standings() {
  const totals = new Map((state?.players || []).map((player) => [player.member_id, { ...player, points: 0, strokes: 0 }]));
  (state?.rounds || []).forEach((round) => {
    if (round.points_enabled === false) return;
    roundResults(round).forEach((row) => {
      row.memberIds.forEach((memberId) => {
        const entry = totals.get(memberId);
        if (!entry) return;
        entry.points += row.points;
        entry.strokes += row.kind === "player" ? row.total : 0;
      });
    });
  });
  return [...totals.values()].sort((a, b) => b.points - a.points || a.strokes - b.strokes || a.name.localeCompare(b.name));
}

function scoreValue(roundId, memberId, holeNumber) {
  return scoresForRound(roundId, memberId).find((score) => score.hole_number === holeNumber)?.strokes || "";
}

function teamScoreValue(roundId, teamId, holeNumber) {
  return teamScoresForRound(roundId, teamId).find((score) => score.hole_number === holeNumber)?.strokes || "";
}

function renderHeaderAccount() {
  const member = state?.member || {};
  const isAdmin = state?.is_admin;
  document.querySelectorAll(".account-link").forEach((link) => {
    const image = link.querySelector("img");
    const label = link.querySelector("span");
    if (image) image.src = member.avatar_url || "./assets/favicon.svg";
    if (label) label.textContent = member.display_name || "Profile";
  });
  document.querySelectorAll(".admin-link").forEach((link) => link.classList.toggle("visible", Boolean(isAdmin)));
}

function renderLeaderboard() {
  const rows = standings();
  leaderboardEl.innerHTML = rows
    .map(
      (player, index) => `
        <article class="scoreboard-row">
          <span class="scoreboard-rank">${index + 1}</span>
          <strong>${escapeHtml(player.name)}</strong>
          <span>${player.points} pts</span>
        </article>
      `,
    )
    .join("");
}

function renderRoundTabs() {
  const rounds = state?.rounds || [];
  if (!selectedRoundId || !roundById(selectedRoundId)) selectedRoundId = rounds[0]?.id || "";
  roundTabsEl.innerHTML = rounds
    .map(
      (round) => `
        <button type="button" data-round-tab="${round.id}" class="${round.id === selectedRoundId ? "active" : ""}">
          ${escapeHtml(round.name)}
        </button>
      `,
    )
    .join("");
}

function renderHoleInputs(round, owner) {
  return Array.from({ length: round.holes }, (_, index) => {
    const hole = index + 1;
    const value =
      owner.kind === "team" ? teamScoreValue(round.id, owner.id, hole) : scoreValue(round.id, owner.id, hole);
    const ownerAttr = owner.kind === "team" ? `data-team-id="${owner.id}"` : `data-member-id="${owner.id}"`;
    return `
      <label>
        <span>${hole}</span>
        <input data-score-input data-round-id="${round.id}" ${ownerAttr} data-hole="${hole}" type="number" inputmode="numeric" min="1" max="20" value="${value}" />
      </label>
    `;
  }).join("");
}

function renderScoreEntry() {
  const round = roundById(selectedRoundId);
  if (!round) {
    scoreEntryEl.innerHTML = "";
    scoreEntryMetaEl.textContent = "";
    return;
  }
  scoreEntryMetaEl.textContent = `${round.format === "scramble" ? "Scramble" : "Individual"} · ${round.holes} holes`;
  const owners =
    round.format === "scramble"
      ? roundTeams(round.id).map((team) => ({
          kind: "team",
          id: team.id,
          name: `${team.name}: ${teamMemberIds(team.id)
            .map((id) => playerById(id)?.name || "Player")
            .join(", ")}`,
        }))
      : (state?.players || []).map((player) => ({ kind: "player", id: player.member_id, name: player.name }));

  scoreEntryEl.innerHTML = owners.length
    ? owners
        .map(
          (owner) => `
            <article class="score-entry-row">
              <div>
                <strong>${escapeHtml(owner.name)}</strong>
                <span>${scoreTotal(owner.kind === "team" ? teamScoresForRound(round.id, owner.id) : scoresForRound(round.id, owner.id)) || "-"}</span>
              </div>
              <div class="hole-grid">${renderHoleInputs(round, owner)}</div>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-note">No teams are set for this scramble round yet.</p>`;
}

function drinkCard(memberId) {
  return (state?.drink_cards || []).find((card) => card.member_id === memberId) || {};
}

function renderDrinks() {
  const defaultAllotment = Number(state?.scoring?.drink_allotment || 0);
  drinkCardsEl.innerHTML = (state?.players || [])
    .map((player) => {
      const card = drinkCard(player.member_id);
      const allotment = card.allotment ?? defaultAllotment;
      return `
        <article class="drink-card">
          <strong>${escapeHtml(player.name)}</strong>
          <label>Allotment <input data-drink-input data-member-id="${player.member_id}" data-field="allotment" type="number" min="0" max="200" value="${allotment}" /></label>
          <label>Consumed <input data-drink-input data-member-id="${player.member_id}" data-field="consumed" type="number" min="0" max="200" value="${card.consumed || 0}" /></label>
          <label>Mulligans <input data-drink-input data-member-id="${player.member_id}" data-field="mulligans" type="number" min="0" max="200" value="${card.mulligans || 0}" /></label>
        </article>
      `;
    })
    .join("");
}

function renderRoundSetup() {
  roundSetupEl.innerHTML = (state?.rounds || [])
    .map(
      (round, index) => `
        <article class="admin-card" data-round-setup="${round.id}">
          <div class="admin-card-head">
            <strong>${escapeHtml(round.name)}</strong>
            <label class="admin-check"><input name="points_enabled" type="checkbox" ${round.points_enabled === false ? "" : "checked"} /> Points</label>
          </div>
          <div class="admin-grid">
            <label>Name <input name="name" type="text" value="${escapeHtml(round.name)}" /></label>
            <label>Format
              <select name="format">
                <option value="individual" ${round.format === "scramble" ? "" : "selected"}>Individual</option>
                <option value="scramble" ${round.format === "scramble" ? "selected" : ""}>Scramble</option>
              </select>
            </label>
            <label>Status
              <select name="status">
                ${["planned", "live", "complete"].map((status) => `<option value="${status}" ${round.status === status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
            </label>
            <label>Holes <input name="holes" type="number" min="1" max="36" value="${round.holes || 18}" /></label>
            <input name="sort_order" type="hidden" value="${round.sort_order || index + 1}" />
          </div>
        </article>
      `,
    )
    .join("");
}

function renderTeamSetup() {
  const scrambleRounds = (state?.rounds || []).filter((round) => round.format === "scramble");
  teamSetupEl.innerHTML = scrambleRounds
    .map((round) => {
      const teams = roundTeams(round.id);
      const rows = teams.length ? teams : [{ round_id: round.id, name: "Team 1", sort_order: 1 }, { round_id: round.id, name: "Team 2", sort_order: 2 }];
      return `
        <article class="admin-card team-setup-round" data-team-round="${round.id}">
          <div class="admin-card-head">
            <strong>${escapeHtml(round.name)} Teams</strong>
            <button type="button" data-add-team="${round.id}">Add Team</button>
          </div>
          <div class="team-setup-list">
            ${rows.map((team, index) => renderTeamSetupRow(round.id, team, index)).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTeamSetupRow(roundId, team = {}, index = 0) {
  const members = team.id ? teamMemberIds(team.id) : [];
  return `
    <div class="team-setup-row" data-team-row data-team-id="${team.id || ""}">
      <input name="team_name" type="text" value="${escapeHtml(team.name || `Team ${index + 1}`)}" />
      <input name="team_sort_order" type="hidden" value="${team.sort_order || index + 1}" />
      <div class="team-member-checks">
        ${(state?.players || [])
          .map(
            (player) => `
              <label>
                <input name="team_member" type="checkbox" value="${player.member_id}" ${members.includes(player.member_id) ? "checked" : ""} />
                ${escapeHtml(player.name)}
              </label>
            `,
          )
          .join("")}
      </div>
      <button type="button" data-remove-team>Remove Team</button>
    </div>
  `;
}

function renderSetup() {
  setupPanel.hidden = !state?.is_admin;
  if (!state?.is_admin) return;
  pointsInput.value = (state.scoring?.points_by_position || []).join(", ");
  drinkAllotmentInput.value = state.scoring?.drink_allotment || 0;
  renderRoundSetup();
  renderTeamSetup();
}

function render() {
  renderHeaderAccount();
  renderLeaderboard();
  renderRoundTabs();
  renderScoreEntry();
  renderDrinks();
  renderSetup();
}

async function loadScoring(message = "Loading live scoring...") {
  setStatus(message, "working");
  state = await requestJson(API_ENDPOINT);
  render();
  setStatus("Live scoring loaded.", "success");
}

async function patchScoring(payload, message) {
  setStatus(message, "working");
  state = await requestJson(API_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  render();
  setStatus("Saved.", "success");
}

roundTabsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-round-tab]");
  if (!button) return;
  selectedRoundId = button.dataset.roundTab;
  renderRoundTabs();
  renderScoreEntry();
});

scoreEntryEl.addEventListener("change", async (event) => {
  const input = event.target.closest("[data-score-input]");
  if (!input || !input.value) return;
  await patchScoring(
    {
      mode: "score",
      round_id: input.dataset.roundId,
      member_id: input.dataset.memberId,
      team_id: input.dataset.teamId,
      hole_number: Number(input.dataset.hole),
      strokes: Number(input.value),
    },
    "Saving score...",
  ).catch((error) => setStatus(error.message, "error"));
});

drinkCardsEl.addEventListener("change", async (event) => {
  const input = event.target.closest("[data-drink-input]");
  if (!input) return;
  const card = input.closest(".drink-card");
  const memberId = input.dataset.memberId;
  await patchScoring(
    {
      mode: "drink",
      member_id: memberId,
      allotment: Number(card.querySelector('[data-field="allotment"]').value || 0),
      consumed: Number(card.querySelector('[data-field="consumed"]').value || 0),
      mulligans: Number(card.querySelector('[data-field="mulligans"]').value || 0),
    },
    "Saving drinks...",
  ).catch((error) => setStatus(error.message, "error"));
});

teamSetupEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-team]");
  if (button) {
    const list = button.closest("[data-team-round]").querySelector(".team-setup-list");
    list.insertAdjacentHTML("beforeend", renderTeamSetupRow(button.dataset.addTeam, { name: `Team ${list.children.length + 1}` }, list.children.length));
    return;
  }
  const removeButton = event.target.closest("[data-remove-team]");
  if (removeButton) removeButton.closest("[data-team-row]")?.remove();
});

saveSetupBtn.addEventListener("click", async () => {
  const rounds = [...roundSetupEl.querySelectorAll("[data-round-setup]")].map((card) => ({
    id: card.dataset.roundSetup,
    name: card.querySelector('[name="name"]').value,
    format: card.querySelector('[name="format"]').value,
    status: card.querySelector('[name="status"]').value,
    holes: Number(card.querySelector('[name="holes"]').value || 18),
    sort_order: Number(card.querySelector('[name="sort_order"]').value || 0),
    points_enabled: card.querySelector('[name="points_enabled"]').checked,
  }));
  const teams = [...teamSetupEl.querySelectorAll("[data-team-round]")].flatMap((roundCard) =>
    [...roundCard.querySelectorAll("[data-team-row]")].map((row, index) => ({
      id: row.dataset.teamId,
      round_id: roundCard.dataset.teamRound,
      name: row.querySelector('[name="team_name"]').value,
      sort_order: Number(row.querySelector('[name="team_sort_order"]').value || index + 1),
      member_ids: [...row.querySelectorAll('[name="team_member"]:checked')].map((input) => input.value),
    })),
  );
  await patchScoring(
    {
      mode: "setup",
      points_by_position: pointsInput.value.split(",").map((part) => Number(part.trim() || 0)),
      drink_allotment: Number(drinkAllotmentInput.value || 0),
      rounds,
      teams,
    },
    "Saving setup...",
  ).catch((error) => setStatus(error.message, "error"));
});

refreshBtn.addEventListener("click", () => {
  loadScoring("Refreshing...").catch((error) => setStatus(error.message, "error"));
});

loadScoring().catch((error) => setStatus(error.message, "error"));
