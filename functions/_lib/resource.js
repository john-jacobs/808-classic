import { supabaseRequest } from "./supabase.js";

export async function requireActiveTripPost(env, postId) {
  const posts = await supabaseRequest(
    env,
    `/rest/v1/posts?select=id&trip_id=eq.${env.SUPABASE_TRIP_ID}&id=eq.${postId}&limit=1`,
  );
  if (!posts?.length) throw Object.assign(new Error("Post was not found in the active trip"), { status: 404 });
  return posts[0];
}

export async function requireActiveTripRound(env, roundId) {
  const rounds = await supabaseRequest(
    env,
    `/rest/v1/rounds?select=id&trip_id=eq.${env.SUPABASE_TRIP_ID}&id=eq.${roundId}&limit=1`,
  );
  if (!rounds?.length) throw Object.assign(new Error("Round was not found in the active trip"), { status: 404 });
  return rounds[0];
}
