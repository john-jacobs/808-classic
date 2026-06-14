import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest, supabaseStorage } from "../_lib/supabase.js";

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

  // Resolve signed URLs for private Supabase Storage media.
  // Bundled asset paths (starting with "./") are served directly and skipped.
  for (const post of posts) {
    for (const item of post.media || []) {
      if (!item.storage_path || item.storage_path.startsWith("./")) continue;
      try {
        const signed = await supabaseStorage(
          context.env,
          `/object/sign/trip-media/${item.storage_path}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ expiresIn: 3600 }),
          },
        );
        item.url = `${context.env.SUPABASE_URL}/storage/v1${signed.signedURL}`;
      } catch {
        // Non-fatal: the item will render without a URL rather than crashing the feed
      }
    }
  }

  return json({ posts });
});
