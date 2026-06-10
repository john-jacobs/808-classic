import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { requireActiveTripPost } from "../_lib/resource.js";
import { supabaseRequest } from "../_lib/supabase.js";

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const body = String(input.body || "").trim();

  if (!input.postId) return apiError(400, "postId is required");
  if (!body || body.length > 2000) return apiError(400, "Comment text must be between 1 and 2,000 characters");

  await requireActiveTripPost(context.env, input.postId);

  const comments = await supabaseRequest(context.env, "/rest/v1/comments?select=*", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: {
      post_id: input.postId,
      author_id: member.id,
      body,
    },
  });

  return json({ comment: comments[0] }, { status: 201 });
});
