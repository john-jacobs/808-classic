import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const DEFAULT_POINTS = [10, 7, 5, 3, 2, 1, 0];

function requireAdmin(member) {
  if (!["owner", "admin"].includes(member.role)) {
    throw Object.assign(new Error("Only admins can edit scoring setup"), { status: 403 });
  }
}

function cleanString(value, max = 160) {
  return String(value || "").trim().slice(0, max);
}

function cleanInteger(value, fallback = 0, min = 0, max = 200) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function playerName(player = {}) {
  return player.person?.display_name || player.member?.display_name || "Player";
}

async function loadTrip(env) {
  const trips = await supabaseRequest(
    env,
    `/rest/v1/trips?id=eq.${env.SUPABASE_TRIP_ID}&select=id,name,settings&limit=1`,
  );
  return trips?.[0] || {};
}

async function loadPlayers(env) {
  const [participantRows, linkRows] = await Promise.all([
    supabaseRequest(
      env,
      `/rest/v1/tournament_participants?trip_id=eq.${env.SUPABASE_TRIP_ID}&participant_type=neq.guest&active=eq.true&select=person_id,sort_order&order=sort_order`,
    ),
    supabaseRequest(
      env,
      `/rest/v1/member_people?select=member_id,person:people(id,display_name,slug,headshot_url,active),member:members(id,display_name,avatar_url)`,
    ),
  ]);

  const participantOrder = new Map(participantRows.map((row, index) => [row.person_id, row.sort_order ?? index + 1]));
  return linkRows
    .filter((row) => participantOrder.has(row.person?.id) && row.person?.active !== false)
    .map((row) => ({
      member_id: row.member_id,
      name: playerName(row),
      sort_order: participantOrder.get(row.person.id),
      person: row.person,
      member: row.member,
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

async function ensureRoundPlayers(env, rounds, players) {
  const bodies = [];
  rounds.forEach((round) => {
    players.forEach((player) => {
      bodies.push({ round_id: round.id, member_id: player.member_id });
    });
  });
  if (!bodies.length) return;
  await supabaseRequest(env, "/rest/v1/round_players?on_conflict=round_id,member_id", {
    method: "POST",
    headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
    body: bodies,
  });
}

async function loadLiveScoring(env, member) {
  const trip = await loadTrip(env);
  const pointsByPosition = Array.isArray(trip.settings?.scoring?.points_by_position)
    ? trip.settings.scoring.points_by_position.map((value) => cleanInteger(value, 0, 0, 500))
    : DEFAULT_POINTS;
  const drinkAllotment = cleanInteger(trip.settings?.scoring?.drink_allotment, 0, 0, 200);

  const [players, rounds] = await Promise.all([
    loadPlayers(env),
    supabaseRequest(
      env,
      `/rest/v1/rounds?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=id,name,course_name,played_on,format,status,holes,sort_order,points_enabled&order=sort_order,played_on`,
    ),
  ]);
  await ensureRoundPlayers(env, rounds, players);

  const roundIds = rounds.map((round) => round.id);
  const roundFilter = roundIds.length ? `in.(${roundIds.join(",")})` : "in.()";
  const [individualScores, teams, teamMembers, teamScores, drinkCards] = await Promise.all([
    roundIds.length
      ? supabaseRequest(env, `/rest/v1/hole_scores?round_id=${roundFilter}&select=round_id,member_id,hole_number,strokes,updated_at`)
      : [],
    roundIds.length
      ? supabaseRequest(env, `/rest/v1/round_teams?round_id=${roundFilter}&select=id,round_id,name,sort_order&order=sort_order`)
      : [],
    roundIds.length
      ? supabaseRequest(env, `/rest/v1/round_team_members?team:round_teams!inner(round_id)&team.round_id=${roundFilter}&select=team_id,member_id`)
      : [],
    roundIds.length
      ? supabaseRequest(env, `/rest/v1/team_hole_scores?round_id=${roundFilter}&select=round_id,team_id,hole_number,strokes,updated_at`)
      : [],
    supabaseRequest(
      env,
      `/rest/v1/drink_cards?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=member_id,allotment,consumed,mulligans,updated_at`,
    ),
  ]);

  const scoring = {
    points_by_position: pointsByPosition,
    drink_allotment: drinkAllotment,
  };

  return json({
    member,
    is_admin: ["owner", "admin"].includes(member.role),
    trip: { id: trip.id, name: trip.name },
    scoring,
    players,
    rounds,
    individual_scores: individualScores,
    teams,
    team_members: teamMembers,
    team_scores: teamScores,
    drink_cards: drinkCards,
  });
}

async function saveSetup(env, input) {
  const points = (Array.isArray(input.points_by_position) ? input.points_by_position : DEFAULT_POINTS)
    .map((value) => cleanInteger(value, 0, 0, 500))
    .slice(0, 20);
  const drinkAllotment = cleanInteger(input.drink_allotment, 0, 0, 200);

  const trip = await loadTrip(env);
  await supabaseRequest(env, `/rest/v1/trips?id=eq.${env.SUPABASE_TRIP_ID}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: {
      settings: {
        ...(trip.settings || {}),
        scoring: {
          ...(trip.settings?.scoring || {}),
          points_by_position: points.length ? points : DEFAULT_POINTS,
          drink_allotment: drinkAllotment,
        },
      },
      updated_at: new Date().toISOString(),
    },
  });

  const rounds = Array.isArray(input.rounds) ? input.rounds : [];
  await Promise.all(
    rounds
      .filter((round) => round.id)
      .map((round, index) =>
        supabaseRequest(env, `/rest/v1/rounds?id=eq.${cleanString(round.id, 80)}&trip_id=eq.${env.SUPABASE_TRIP_ID}`, {
          method: "PATCH",
          headers: { prefer: "return=minimal" },
          body: {
            name: cleanString(round.name, 160) || `Round ${index + 1}`,
            format: cleanString(round.format, 40) === "scramble" ? "scramble" : "individual",
            status: ["planned", "live", "complete"].includes(round.status) ? round.status : "planned",
            holes: cleanInteger(round.holes, 18, 1, 36),
            sort_order: cleanInteger(round.sort_order, index + 1, 0, 100),
            points_enabled: round.points_enabled !== false,
            updated_at: new Date().toISOString(),
          },
        }),
      ),
  );

  const setupTeams = Array.isArray(input.teams) ? input.teams : [];
  for (const round of rounds.filter((row) => row.id && row.format === "scramble")) {
    const roundId = cleanString(round.id, 80);
    const incomingIds = new Set(
      setupTeams
        .filter((team) => cleanString(team.name, 80))
        .map((team) => cleanString(team.id, 80))
        .filter(Boolean),
    );
    const existingTeams = await supabaseRequest(env, `/rest/v1/round_teams?round_id=eq.${roundId}&select=id`);
    await Promise.all(
      existingTeams
        .filter((team) => !incomingIds.has(team.id))
        .map((team) =>
          supabaseRequest(env, `/rest/v1/round_teams?id=eq.${team.id}`, {
            method: "DELETE",
            headers: { prefer: "return=minimal" },
          }),
        ),
    );
  }

  for (const team of setupTeams) {
    const roundId = cleanString(team.round_id, 80);
    const name = cleanString(team.name, 80);
    if (!roundId || !name) continue;
    const body = {
      round_id: roundId,
      name,
      sort_order: cleanInteger(team.sort_order, 0, 0, 100),
      updated_at: new Date().toISOString(),
    };
    const teamIdInput = cleanString(team.id, 80);
    const rows = teamIdInput
      ? await supabaseRequest(env, `/rest/v1/round_teams?id=eq.${teamIdInput}&select=id`, {
          method: "PATCH",
          headers: { prefer: "return=representation" },
          body,
        })
      : await supabaseRequest(env, "/rest/v1/round_teams?on_conflict=round_id,name&select=id", {
          method: "POST",
          headers: { prefer: "resolution=merge-duplicates,return=representation" },
          body,
        });
    const teamId = rows?.[0]?.id;
    if (!teamId) continue;
    await supabaseRequest(env, `/rest/v1/round_team_members?team_id=eq.${teamId}`, {
      method: "DELETE",
      headers: { prefer: "return=minimal" },
    });
    const memberIds = Array.isArray(team.member_ids) ? [...new Set(team.member_ids.map((id) => cleanString(id, 80)).filter(Boolean))] : [];
    if (memberIds.length) {
      await supabaseRequest(env, "/rest/v1/round_team_members?on_conflict=team_id,member_id", {
        method: "POST",
        headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
        body: memberIds.map((memberId) => ({ team_id: teamId, member_id: memberId })),
      });
    }
  }
}

async function saveScore(env, input, member) {
  const holeNumber = cleanInteger(input.hole_number, 0, 1, 36);
  const strokes = cleanInteger(input.strokes, 0, 1, 20);
  if (!holeNumber || !strokes) return apiError(400, "Valid hole number and strokes are required");
  const roundId = cleanString(input.round_id, 80);
  if (!roundId) return apiError(400, "round_id is required");

  if (input.team_id) {
    await supabaseRequest(env, "/rest/v1/team_hole_scores?on_conflict=round_id,team_id,hole_number", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=minimal" },
      body: {
        round_id: roundId,
        team_id: cleanString(input.team_id, 80),
        hole_number: holeNumber,
        strokes,
        entered_by: member.id,
        updated_at: new Date().toISOString(),
      },
    });
    return null;
  }

  const memberId = cleanString(input.member_id, 80);
  if (!memberId) return apiError(400, "member_id is required");
  await supabaseRequest(env, "/rest/v1/hole_scores?on_conflict=round_id,member_id,hole_number", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: {
      round_id: roundId,
      member_id: memberId,
      hole_number: holeNumber,
      strokes,
      entered_by: member.id,
      updated_at: new Date().toISOString(),
    },
  });
  return null;
}

async function saveDrinkCard(env, input, member) {
  const memberId = cleanString(input.member_id, 80);
  if (!memberId) return apiError(400, "member_id is required");
  const consumed = cleanInteger(input.consumed, 0, 0, 200);
  const mulligans = cleanInteger(input.mulligans, 0, 0, consumed);
  await supabaseRequest(env, "/rest/v1/drink_cards?on_conflict=trip_id,member_id", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: {
      trip_id: env.SUPABASE_TRIP_ID,
      member_id: memberId,
      allotment: cleanInteger(input.allotment, 0, 0, 200),
      consumed,
      mulligans,
      updated_by: member.id,
      updated_at: new Date().toISOString(),
    },
  });
  return null;
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  return loadLiveScoring(context.env, member);
});

export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);

  if (input.mode === "setup") {
    requireAdmin(member);
    await saveSetup(context.env, input);
  } else if (input.mode === "score") {
    const error = await saveScore(context.env, input, member);
    if (error) return error;
  } else if (input.mode === "drink") {
    const error = await saveDrinkCard(context.env, input, member);
    if (error) return error;
  } else {
    return apiError(400, "Unknown live scoring update mode");
  }

  return loadLiveScoring(context.env, member);
});
