import { supabaseRequest } from "./supabase.js";

function decodeAccessTokenEmail(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded));
    return String(claims.email || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

function cookieValue(request, name) {
  const cookies = request.headers.get("cookie") || "";
  const prefix = `${name}=`;
  const match = cookies.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

function accessEmail(request, env) {
  const verifiedEmail = request.headers.get("cf-access-authenticated-user-email");
  if (verifiedEmail) return verifiedEmail.trim().toLowerCase();

  const assertionEmail = decodeAccessTokenEmail(request.headers.get("cf-access-jwt-assertion") || "");
  if (assertionEmail) return assertionEmail;

  const cookieEmail = decodeAccessTokenEmail(cookieValue(request, "CF_Authorization"));
  if (cookieEmail) return cookieEmail;

  if (env.ENVIRONMENT === "development") {
    return request.headers.get("x-dev-user-email")?.trim().toLowerCase() || "";
  }

  return "";
}

function displayNameFromEmail(email) {
  const localPart = String(email || "").split("@")[0] || "808 Member";
  return localPart
    .replace(/[._+-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

async function findMember(env, email) {
  const members = await supabaseRequest(
    env,
    `/rest/v1/members?select=id,email,display_name,avatar_url&email=eq.${encodeURIComponent(email)}&limit=1`,
  );
  return members?.[0] || null;
}

async function createMember(env, email) {
  const members = await supabaseRequest(env, "/rest/v1/members?on_conflict=email&select=id,email,display_name,avatar_url", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: {
      email,
      display_name: displayNameFromEmail(email),
    },
  });
  return members?.[0] || null;
}

async function findMembership(env, memberId) {
  const memberships = await supabaseRequest(
    env,
    `/rest/v1/group_memberships?select=role&group_id=eq.${env.SUPABASE_GROUP_ID}&member_id=eq.${memberId}&limit=1`,
  );
  return memberships?.[0] || null;
}

async function createMembership(env, memberId) {
  const memberships = await supabaseRequest(env, "/rest/v1/group_memberships?on_conflict=group_id,member_id&select=role", {
    method: "POST",
    headers: { prefer: "resolution=ignore-duplicates,return=representation" },
    body: {
      group_id: env.SUPABASE_GROUP_ID,
      member_id: memberId,
      role: "member",
    },
  });
  return memberships?.[0] || (await findMembership(env, memberId));
}

export async function requireMember(context) {
  const email = accessEmail(context.request, context.env);
  if (!email) throw Object.assign(new Error("Cloudflare Access identity is missing"), { status: 401 });

  const member = (await findMember(context.env, email)) || (await createMember(context.env, email));
  if (!member) throw Object.assign(new Error("This email could not be linked to an 808 member"), { status: 500 });

  const membership = (await findMembership(context.env, member.id)) || (await createMembership(context.env, member.id));
  if (!membership) throw Object.assign(new Error("This member could not be linked to the 808 group"), { status: 500 });

  return { ...member, role: membership.role };
}
