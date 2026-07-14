import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const INTERBAY_CARD = {
  course: "Interbay Golf Center",
  day: "Day 1",
  round_name: "Thursday Warmup",
  tees: {
    back: [288, 153, 95, 102, 130, 186, 164, 124, 130],
    middle: [269, 133, 95, 94, 118, 161, 150, 106, 117],
    forward: [252, 81, 88, 86, 105, 95, 98, 85, 117],
  },
  par: [4, 3, 3, 3, 3, 3, 3, 3, 3],
  handicap: [2, 6, 9, 8, 4, 1, 3, 7, 5],
  source_url: "https://www.premiergc.com/-scorecard",
};

function cleanString(value, max = 120) {
  return String(value || "").trim().slice(0, max);
}

function cleanInteger(value, fallback = 0, min = 0, max = 200) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function playerName(row = {}) {
  return row.person?.display_name || row.member?.display_name || "Player";
}

async function loadPlayers(env) {
  const [participantRows, linkRows] = await Promise.all([
    supabaseRequest(
      env,
      `/rest/v1/tournament_participants?trip_id=eq.${env.SUPABASE_TRIP_ID}&participant_type=eq.player&attendance_status=eq.confirmed&active=eq.true&select=person_id,sort_order&order=sort_order`,
    ),
    supabaseRequest(
      env,
      `/rest/v1/member_people?select=member_id,person:people(id,display_name,slug,headshot_url,active),member:members(id,display_name,avatar_url)`,
    ),
  ]);

  const orderByPerson = new Map(participantRows.map((row, index) => [row.person_id, row.sort_order ?? index + 1]));
  return linkRows
    .filter((row) => orderByPerson.has(row.person?.id) && row.person?.active !== false)
    .map((row) => ({
      member_id: row.member_id,
      name: playerName(row),
      sort_order: orderByPerson.get(row.person.id),
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

async function loadDayOneRound(env) {
  const rounds = await supabaseRequest(
    env,
    `/rest/v1/rounds?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=id,name,course_name,played_on,format,status,holes,sort_order&order=sort_order,played_on`,
  );
  return rounds.find((round) => round.sort_order === 1) || rounds.find((round) => /interbay|warmup/i.test(`${round.name} ${round.course_name}`)) || rounds[0];
}

async function ensureRoundPlayers(env, round, players) {
  if (!round?.id || !players.length) return;
  await supabaseRequest(env, "/rest/v1/round_players?on_conflict=round_id,member_id", {
    method: "POST",
    headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
    body: players.map((player) => ({ round_id: round.id, member_id: player.member_id })),
  });
}

async function loadLeaderboard(env, member) {
  const [players, round] = await Promise.all([loadPlayers(env), loadDayOneRound(env)]);
  if (!round?.id) return apiError(404, "Day 1 round is not configured");
  await ensureRoundPlayers(env, round, players);

  const scores = await supabaseRequest(
    env,
    `/rest/v1/hole_scores?round_id=eq.${round.id}&select=round_id,member_id,hole_number,strokes,updated_at`,
  );

  return json({
    member,
    card: INTERBAY_CARD,
    round: {
      ...round,
      holes: 9,
      format: "individual",
    },
    players,
    scores,
  });
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  return loadLeaderboard(context.env, member);
});

export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const roundId = cleanString(input.round_id, 80);
  const memberId = cleanString(input.member_id, 80);
  const holeNumber = cleanInteger(input.hole_number, 0, 1, 9);
  const shouldDelete = input.strokes === null || input.strokes === "";
  const strokes = shouldDelete ? null : cleanInteger(input.strokes, 0, 1, 20);

  if (!roundId || !memberId) return apiError(400, "round_id and member_id are required");
  if (!holeNumber || (!shouldDelete && !strokes)) return apiError(400, "Valid hole number and strokes are required");

  const roundRows = await supabaseRequest(
    context.env,
    `/rest/v1/rounds?trip_id=eq.${context.env.SUPABASE_TRIP_ID}&id=eq.${roundId}&select=id&limit=1`,
  );
  if (!roundRows?.length) return apiError(404, "Day 1 round was not found");

  if (shouldDelete) {
    await supabaseRequest(
      context.env,
      `/rest/v1/hole_scores?round_id=eq.${roundId}&member_id=eq.${memberId}&hole_number=eq.${holeNumber}`,
      {
        method: "DELETE",
        headers: { prefer: "return=minimal" },
      },
    );
    return loadLeaderboard(context.env, member);
  }

  await supabaseRequest(context.env, "/rest/v1/hole_scores?on_conflict=round_id,member_id,hole_number", {
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

  return loadLeaderboard(context.env, member);
});
