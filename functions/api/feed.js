import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

export const onRequestGet = withApiErrors(async (context) => {
  await requireMember(context);

  const select = [
    "id",
    "type",
    "body",
    "headline",
    "dek",
    "byline",
    "location",
    "published_at",
    "metadata",
    "pinned",
    "created_at",
    "author:members!posts_author_id_fkey(id,display_name,avatar_url)",
    "media:post_media(id,storage_path,mime_type,width,height,sort_order)",
    "comments(id,body,created_at,author:members!comments_author_id_fkey(id,display_name,avatar_url))",
    "reactions:post_reactions(reaction,member_id)",
  ].join(",");

  const posts = await supabaseRequest(
    context.env,
    `/rest/v1/posts?trip_id=eq.${context.env.SUPABASE_TRIP_ID}&select=${encodeURIComponent(select)}&order=pinned.desc,created_at.desc&limit=50`,
  );

  return json({ posts });
});
