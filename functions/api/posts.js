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

  if (!body && type !== "photo") return apiError(400, "A post needs text or a photo");
  if (body.length > 5000) return apiError(400, "Post text must be 5,000 characters or fewer");
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
    },
  });

  return json({ post: posts[0] }, { status: 201 });
});
