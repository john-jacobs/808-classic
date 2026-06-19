import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const ATTENDANCE_STATUSES = new Set(["confirmed", "tentative", "not_attending"]);

function cleanString(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function cleanNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function slugFromMember(member) {
  const source = member.email?.split("@")[0] || member.display_name || member.id;
  const base = String(source)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "member"}-${String(member.id).slice(0, 8)}`;
}

async function findPersonForMember(env, memberId) {
  const links = await supabaseRequest(
    env,
    `/rest/v1/member_people?member_id=eq.${memberId}&select=person:people(*)&limit=1`,
  );
  return links?.[0]?.person || null;
}

async function createPersonForMember(env, member) {
  const rows = await supabaseRequest(env, "/rest/v1/people?select=*", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: {
      group_id: env.SUPABASE_GROUP_ID,
      slug: slugFromMember(member),
      display_name: member.display_name,
      person_type: "current_player",
      sort_order: 999,
      active: true,
    },
  });
  const person = rows?.[0];
  if (!person) throw new Error("Profile could not be created");

  await supabaseRequest(env, "/rest/v1/member_people", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: {
      member_id: member.id,
      person_id: person.id,
    },
  });

  return person;
}

async function ensurePerson(env, member) {
  return (await findPersonForMember(env, member.id)) || (await createPersonForMember(env, member));
}

async function findParticipant(env, personId) {
  const rows = await supabaseRequest(
    env,
    `/rest/v1/tournament_participants?trip_id=eq.${env.SUPABASE_TRIP_ID}&person_id=eq.${personId}&select=*&limit=1`,
  );
  return rows?.[0] || null;
}

async function createParticipant(env, personId) {
  const rows = await supabaseRequest(env, "/rest/v1/tournament_participants?select=*", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: {
      trip_id: env.SUPABASE_TRIP_ID,
      person_id: personId,
      participant_type: "player",
      attendance_status: "not_attending",
      sort_order: 999,
      active: false,
    },
  });
  return rows?.[0] || null;
}

async function ensureParticipant(env, personId) {
  return (await findParticipant(env, personId)) || (await createParticipant(env, personId));
}

function serializeSettings(member, person, participant) {
  return {
    member: {
      id: member.id,
      email: member.email,
      role: member.role,
      display_name: member.display_name,
      avatar_url: member.avatar_url,
    },
    profile: {
      display_name: person.display_name,
      title: person.title,
      city: person.city,
      height: person.height,
      bio: person.bio,
      quote: person.quote,
      strength: person.strength,
      weakness: person.weakness,
      headshot_url: person.headshot_url,
      action_photo_url: person.action_photo_url,
    },
    trip_profile: {
      attendance_status: participant.attendance_status,
      arrival: participant.arrival,
      departure: participant.departure,
      handicap: participant.handicap,
      classic_record: participant.classic_record,
      detail: participant.detail,
      active: participant.active,
    },
  };
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const person = await ensurePerson(context.env, member);
  const participant = await ensureParticipant(context.env, person.id);
  return json(serializeSettings(member, person, participant));
});

export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const person = await ensurePerson(context.env, member);
  const participant = await ensureParticipant(context.env, person.id);
  const attendanceStatus = ATTENDANCE_STATUSES.has(input.attendance_status) ? input.attendance_status : participant.attendance_status;
  const active = attendanceStatus !== "not_attending";
  const displayName = cleanString(input.display_name, 120) || member.display_name;

  if (cleanString(input.bio, 2000).length > 1800) return apiError(400, "Bio is too long");

  await supabaseRequest(context.env, `/rest/v1/members?id=eq.${member.id}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: {
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
  });

  const people = await supabaseRequest(context.env, `/rest/v1/people?id=eq.${person.id}&select=*`, {
    method: "PATCH",
    headers: { prefer: "return=representation" },
    body: {
      display_name: displayName,
      title: cleanString(input.title, 120),
      city: cleanString(input.city, 120),
      height: cleanString(input.height, 40),
      bio: cleanString(input.bio, 1800),
      quote: cleanString(input.quote, 400),
      strength: cleanString(input.strength, 120),
      weakness: cleanString(input.weakness, 120),
      updated_at: new Date().toISOString(),
    },
  });

  const participants = await supabaseRequest(
    context.env,
    `/rest/v1/tournament_participants?trip_id=eq.${context.env.SUPABASE_TRIP_ID}&person_id=eq.${person.id}&select=*`,
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: {
        attendance_status: attendanceStatus,
        participant_type: "player",
        arrival: cleanString(input.arrival, 240),
        departure: cleanString(input.departure, 240),
        handicap: cleanNumber(input.handicap),
        classic_record: cleanString(input.classic_record, 120),
        detail: cleanString(input.detail, 800),
        active,
        updated_at: new Date().toISOString(),
      },
    },
  );

  return json(serializeSettings({ ...member, display_name: displayName }, people[0], participants[0]));
});
