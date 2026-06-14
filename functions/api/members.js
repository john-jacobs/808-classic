import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const MEMBER_SELECT = "id,email,display_name,avatar_url";
const VALID_ROLES = new Set(["owner", "admin", "member"]);

// GET /api/members
// admin/owner → all members in the group with their roles
// member       → just themselves
export const onRequestGet = withApiErrors(async (context) => {
  const me = await requireMember(context);
  const isAdmin = ["owner", "admin"].includes(me.role);

  if (!isAdmin) {
    return json({
      members: [
        {
          id: me.id,
          email: me.email,
          display_name: me.display_name,
          avatar_url: me.avatar_url,
          role: me.role,
        },
      ],
    });
  }

  // Fetch all memberships for this group, then hydrate with member details
  const membershipRows = await supabaseRequest(
    context.env,
    `/rest/v1/group_memberships?select=member_id,role&group_id=eq.${context.env.SUPABASE_GROUP_ID}`,
  );

  if (!membershipRows?.length) return json({ members: [] });

  const memberIds = membershipRows.map((m) => m.member_id).join(",");
  const memberRows = await supabaseRequest(
    context.env,
    `/rest/v1/members?select=${MEMBER_SELECT}&id=in.(${memberIds})&order=display_name`,
  );

  const roleByMemberId = new Map(membershipRows.map((m) => [m.member_id, m.role]));
  const members = memberRows.map((m) => ({ ...m, role: roleByMemberId.get(m.id) || null }));

  return json({ members });
});

// POST /api/members
// admin/owner only: add a new member to the group.
// Creates a members row if the email is new, then upserts a group_memberships row.
// Body: { email, display_name, role? }
export const onRequestPost = withApiErrors(async (context) => {
  const me = await requireMember(context);
  if (!["owner", "admin"].includes(me.role)) {
    return apiError(403, "Only admins can add members");
  }

  const input = await readJson(context.request);
  const email = String(input.email || "").trim().toLowerCase();
  const displayName = String(input.display_name || "").trim();
  const role = VALID_ROLES.has(input.role) ? input.role : "member";

  if (!email) return apiError(400, "email is required");
  if (!displayName) return apiError(400, "display_name is required");
  if (role !== "member" && me.role !== "owner") {
    return apiError(403, "Only the owner can assign admin or owner roles");
  }

  // Reuse existing member record if this email is already known
  const existing = await supabaseRequest(
    context.env,
    `/rest/v1/members?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
  );

  let memberId;
  if (existing?.length) {
    memberId = existing[0].id;
  } else {
    const created = await supabaseRequest(context.env, "/rest/v1/members?select=id", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: { email, display_name: displayName },
    });
    memberId = created[0].id;
  }

  // Upsert group membership — idempotent if they're already in the group
  await supabaseRequest(
    context.env,
    `/rest/v1/group_memberships?on_conflict=member_id,group_id`,
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=minimal" },
      body: {
        member_id: memberId,
        group_id: context.env.SUPABASE_GROUP_ID,
        role,
      },
    },
  );

  return json({ member: { id: memberId, email, display_name: displayName, role } }, { status: 201 });
});

// PATCH /api/members?id=<memberId>
// admin/owner: update any member's role or display_name
// member:       update only their own display_name / avatar_url (role change forbidden)
// Body: { role?, display_name?, avatar_url? }
export const onRequestPatch = withApiErrors(async (context) => {
  const me = await requireMember(context);
  const targetId = new URL(context.request.url).searchParams.get("id") || me.id;
  const isAdmin = ["owner", "admin"].includes(me.role);
  const isSelf = targetId === me.id;

  if (!isAdmin && !isSelf) {
    return apiError(403, "You can only update your own profile");
  }

  const input = await readJson(context.request);

  // Member-record updates (display_name, avatar_url)
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
    await supabaseRequest(context.env, `/rest/v1/members?id=eq.${targetId}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: memberUpdates,
    });
  }

  // Role update: admin/owner only, and only owner can promote to admin/owner
  if (input.role !== undefined) {
    if (!isAdmin) return apiError(403, "You cannot change your own role");
    if (!VALID_ROLES.has(input.role)) return apiError(400, "role must be owner, admin, or member");
    if (input.role !== "member" && me.role !== "owner") {
      return apiError(403, "Only the owner can assign admin or owner roles");
    }

    await supabaseRequest(
      context.env,
      `/rest/v1/group_memberships?member_id=eq.${targetId}&group_id=eq.${context.env.SUPABASE_GROUP_ID}`,
      {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: { role: input.role },
      },
    );
  }

  return json({ ok: true });
});

// DELETE /api/members?id=<memberId>
// owner only: remove a member from the group (does not delete the members row)
export const onRequestDelete = withApiErrors(async (context) => {
  const me = await requireMember(context);
  if (me.role !== "owner") return apiError(403, "Only the owner can remove members");

  const targetId = new URL(context.request.url).searchParams.get("id");
  if (!targetId) return apiError(400, "id query parameter is required");
  if (targetId === me.id) return apiError(400, "You cannot remove yourself from the group");

  await supabaseRequest(
    context.env,
    `/rest/v1/group_memberships?member_id=eq.${targetId}&group_id=eq.${context.env.SUPABASE_GROUP_ID}`,
    { method: "DELETE" },
  );

  return json({ ok: true });
});
