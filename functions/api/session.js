import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { createSignedStorageUrl } from "../_lib/supabase.js";

function needsSignedUrl(path = "") {
  return path && !path.startsWith(".") && !path.startsWith("http") && !path.startsWith("data:");
}

async function displayImageUrl(env, path) {
  if (!needsSignedUrl(path)) return path || "";
  try {
    return await createSignedStorageUrl(env, "trip-media", path);
  } catch (error) {
    console.warn("Session avatar signing failed.", error);
    return path;
  }
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  return json({
    member: {
      ...member,
      avatar_url: await displayImageUrl(context.env, member.avatar_url),
    },
    groupId: context.env.SUPABASE_GROUP_ID,
    tripId: context.env.SUPABASE_TRIP_ID,
  });
});
