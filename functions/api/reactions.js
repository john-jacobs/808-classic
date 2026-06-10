import { withApiErrors } from "../_lib/handler.js";
import { json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { requireActiveTripPost } from "../_lib/resource.js";
import { supabaseRequest } from "../_lib/supabase.js";

const REACTIONS = new Set(["orange_jacket", "mulligan", "tough_scene", "disputed", "applause"]);

async function reactionInput(context) {
  const input = await readJson(context.request);
  if (!input.postId) throw Object.assign(new Error("postId is required"), { status: 400 });
  if (!REACTIONS.has(input.reaction)) throw Object.assign(new Error("Invalid reaction"), { status: 400 });
  return input;
}

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await reactionInput(context);
  await requireActiveTripPost(context.env, input.postId);

  const reactions = await supabaseRequest(context.env, "/rest/v1/post_reactions?on_conflict=post_id,member_id,reaction&select=*", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: {
      post_id: input.postId,
      member_id: member.id,
      reaction: input.reaction,
    },
  });

  return json({ reaction: reactions[0] });
});

export const onRequestDelete = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await reactionInput(context);
  await requireActiveTripPost(context.env, input.postId);

  await supabaseRequest(
    context.env,
    `/rest/v1/post_reactions?post_id=eq.${input.postId}&member_id=eq.${member.id}&reaction=eq.${input.reaction}`,
    { method: "DELETE" },
  );

  return json({ removed: true });
});
