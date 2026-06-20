import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { createSignedStorageUrl, supabaseRequest, uploadStorageObject } from "../_lib/supabase.js";

const ATTENDANCE_STATUSES = new Set(["confirmed", "tentative", "not_attending"]);
const MAX_PROFILE_PHOTO_CHARS = 4_500_000;

function cleanString(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function cleanNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function preserveString(input, key, currentValue, max = 1000) {
  if (!Object.prototype.hasOwnProperty.call(input, key)) return currentValue;
  const nextValue = cleanString(input[key], max);
  if (!nextValue && cleanString(currentValue)) return currentValue;
  return nextValue;
}

function preserveNumber(input, key, currentValue) {
  if (!Object.prototype.hasOwnProperty.call(input, key)) return currentValue;
  const nextValue = cleanNumber(input[key]);
  if (nextValue === null && currentValue !== null && currentValue !== undefined) return currentValue;
  return nextValue;
}

function parseDataUrl(dataUrl) {
  const value = String(dataUrl || "").trim();
  if (value.length > MAX_PROFILE_PHOTO_CHARS) throw Object.assign(new Error("Profile photo is too large"), { status: 400 });
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    bytes: Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0)),
  };
}

function fileExtension(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function needsSignedUrl(path = "") {
  return path && !path.startsWith(".") && !path.startsWith("http") && !path.startsWith("data:");
}

async function displayImageUrl(env, path) {
  if (!needsSignedUrl(path)) return path || "";
  try {
    return await createSignedStorageUrl(env, "trip-media", path);
  } catch (error) {
    console.warn("Profile image signing failed.", error);
    return path;
  }
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

async function serializeSettings(env, member, person, participant) {
  const headshotUrl = await displayImageUrl(env, person.headshot_url);
  const actionPhotoUrl = await displayImageUrl(env, person.action_photo_url);
  const avatarUrl = await displayImageUrl(env, member.avatar_url);

  return {
    member: {
      id: member.id,
      email: member.email,
      role: member.role,
      display_name: member.display_name,
      avatar_url: avatarUrl,
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
      headshot_url: headshotUrl,
      action_photo_url: actionPhotoUrl,
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
  return json(await serializeSettings(context.env, member, person, participant));
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

  let headshotUrl = person.headshot_url;
  let avatarUrl = member.avatar_url || person.headshot_url;
  const photo = parseDataUrl(input.headshot_data_url);
  if (photo) {
    const extension = fileExtension(photo.mimeType);
    headshotUrl = `${context.env.SUPABASE_GROUP_ID}/${context.env.SUPABASE_TRIP_ID}/profiles/${person.id}/headshot-${crypto.randomUUID()}.${extension}`;
    avatarUrl = headshotUrl;
    await uploadStorageObject(context.env, "trip-media", headshotUrl, photo.bytes, photo.mimeType);
  } else if (input.headshot_data_url) {
    return apiError(400, "Profile photo must be a JPG, PNG, or WebP image");
  }
  const persistedHeadshotUrl = headshotUrl || avatarUrl;

  await supabaseRequest(context.env, `/rest/v1/members?id=eq.${member.id}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: {
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
  });

  const people = await supabaseRequest(context.env, `/rest/v1/people?id=eq.${person.id}&select=*`, {
    method: "PATCH",
    headers: { prefer: "return=representation" },
    body: {
      display_name: displayName,
      title: preserveString(input, "title", person.title, 120),
      city: preserveString(input, "city", person.city, 120),
      height: preserveString(input, "height", person.height, 40),
      bio: preserveString(input, "bio", person.bio, 1800),
      quote: preserveString(input, "quote", person.quote, 400),
      strength: preserveString(input, "strength", person.strength, 120),
      weakness: preserveString(input, "weakness", person.weakness, 120),
      headshot_url: persistedHeadshotUrl,
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
        arrival: preserveString(input, "arrival", participant.arrival, 240),
        departure: preserveString(input, "departure", participant.departure, 240),
        handicap: preserveNumber(input, "handicap", participant.handicap),
        classic_record: preserveString(input, "classic_record", participant.classic_record, 120),
        detail: preserveString(input, "detail", participant.detail, 800),
        active,
        updated_at: new Date().toISOString(),
      },
    },
  );

  return json(await serializeSettings(context.env, { ...member, display_name: displayName, avatar_url: avatarUrl }, people[0], participants[0]));
});
