import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const POST_TYPES = new Set(["dispatch", "photo", "score_update", "official_notice", "rules_dispute"]);

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const body = String(input.body || "").trim();
  const type = POST_TYPES.has(input.type) ? input.type : "dispatch";
  const headline = String(input.headline || "").trim();
  const dek = String(input.dek || "").trim();
  const byline = String(input.byline || "").trim();
  const location = String(input.location || "").trim();
  const publishedAt = String(input.published_at || "").trim() || new Date().toISOString();
  const metadata = input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {};

  if (!body && type !== "photo") return apiError(400, "A post needs text or a photo");
  if (body.length > 5000) return apiError(400, "Post text must be 5,000 characters or fewer");
  if (headline.length > 160) return apiError(400, "Headline must be 160 characters or fewer");
  if (dek.length > 260) return apiError(400, "Dek must be 260 characters or fewer");
  if (type === "official_notice" && !["owner", "admin"].includes(member.role)) {
    return apiError(403, "Only group admins can publish official notices");
  }

  const posts = await supabaseRequest(context.env, "/rest/v1/posts?select=*", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: {
      group_id: context.env.SUPABASE_GROUP_ID,
      trip_id: context.env.SUPABASE_TRIP_ID,
      author_id: member.id,
      type,
      body,
      headline,
      dek,
      byline: byline || "808 Wire Staff",
      location,
      published_at: publishedAt,
      metadata,
    },
  });

  return json({ post: posts[0] }, { status: 201 });
});
