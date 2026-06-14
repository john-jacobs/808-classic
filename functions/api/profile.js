import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

// Fields a member may update on their own people record.
// Excludes admin-managed fields: odds, rank, title, sort_order, active, person_type.
const PLAYER_TEXT_FIELDS = ["bio", "quote", "strength", "weakness", "city"];

// GET /api/profile
// Returns the requesting member's auth record + linked people profile (if any).
export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const player = await findPlayer(context.env, member);
  return json({ member, player });
});

// PATCH /api/profile
// Update own member record and/or player profile fields.
// Body (all optional):
//   display_name   — updates members.display_name
//   avatar_url     — updates members.avatar_url
//   bio            — updates people.bio
//   quote          — updates people.quote
//   handicap       — updates people.handicap (0–54, numeric)
//   strength       — updates people.strength
//   weakness       — updates people.weakness
//   city           — updates people.city
export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);

  // ── members table ──────────────────────────────────────────────
  const memberUpdates = {};
  if (input.display_name !== undefined) {
    const name = String(input.display_name).trim();
    if (!name) return apiError(400, "display_name cannot be empty");
    memberUpdates.display_name = name;
  }
  if (input.avatar_url !== undefined) {
    memberUpdates.avatar_url = input.avatar_url || null;
  }

  if (Object.keys(memberUpdates).length) {
    await supabaseRequest(context.env, `/rest/v1/members?id=eq.${member.id}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: memberUpdates,
    });
  }

  // ── people table ───────────────────────────────────────────────
  const playerUpdates = {};
  for (const field of PLAYER_TEXT_FIELDS) {
    if (input[field] !== undefined) {
      playerUpdates[field] = String(input[field]).slice(0, 5000);
    }
  }
  if (input.handicap !== undefined) {
    const hcp = Number(input.handicap);
    if (Number.isNaN(hcp) || hcp < 0 || hcp > 54) {
      return apiError(400, "handicap must be a number between 0 and 54");
    }
    playerUpdates.handicap = hcp;
  }

  let player = null;
  if (Object.keys(playerUpdates).length) {
    const existing = await findPlayer(context.env, member);
    if (existing) {
      const updated = await supabaseRequest(
        context.env,
        `/rest/v1/people?slug=eq.${existing.slug}&group_id=eq.${context.env.SUPABASE_GROUP_ID}&select=*`,
        {
          method: "PATCH",
          headers: { prefer: "return=representation" },
          body: playerUpdates,
        },
      );
      player = updated?.[0] ?? null;
    }
    // If no linked people record the member-only fields still saved above;
    // player stays null and the caller can handle that gracefully.
  }

  return json({ ok: true, player });
});

// ── helpers ────────────────────────────────────────────────────────────────────

// Locate the people row linked to a member.
// Tries people.member_id FK first (ideal), falls back to display_name match.
// Returns the row or null — never throws.
async function findPlayer(env, member) {
  // Preferred: explicit FK (schema may or may not have this column)
  const byId = await supabaseRequest(
    env,
    `/rest/v1/people?member_id=eq.${member.id}&group_id=eq.${env.SUPABASE_GROUP_ID}&select=*&limit=1`,
  ).catch(() => null);
  if (byId?.length) return byId[0];

  // Fallback: match by display_name within the group
  const byName = await supabaseRequest(
    env,
    `/rest/v1/people?display_name=eq.${encodeURIComponent(member.display_name)}&group_id=eq.${env.SUPABASE_GROUP_ID}&select=*&limit=1`,
  ).catch(() => null);
  return byName?.[0] ?? null;
}
