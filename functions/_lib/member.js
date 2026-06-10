import { supabaseRequest } from "./supabase.js";

function accessEmail(request, env) {
  const verifiedEmail = request.headers.get("cf-access-authenticated-user-email");
  if (verifiedEmail) return verifiedEmail.trim().toLowerCase();

  if (env.ENVIRONMENT === "development") {
    return request.headers.get("x-dev-user-email")?.trim().toLowerCase() || "";
  }

  return "";
}

export async function requireMember(context) {
  const email = accessEmail(context.request, context.env);
  if (!email) throw Object.assign(new Error("Cloudflare Access identity is missing"), { status: 401 });

  const members = await supabaseRequest(
    context.env,
    `/rest/v1/members?select=id,email,display_name,avatar_url&email=eq.${encodeURIComponent(email)}&limit=1`,
  );
  const member = members?.[0];
  if (!member) throw Object.assign(new Error("This email is not linked to an 808 member"), { status: 403 });

  const memberships = await supabaseRequest(
    context.env,
    `/rest/v1/group_memberships?select=role&group_id=eq.${context.env.SUPABASE_GROUP_ID}&member_id=eq.${member.id}&limit=1`,
  );
  const membership = memberships?.[0];
  if (!membership) throw Object.assign(new Error("This member does not have access to the 808 group"), { status: 403 });

  return { ...member, role: membership.role };
}
