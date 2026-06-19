import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { createSignedStorageUrl, supabaseRequest } from "../_lib/supabase.js";

function needsSignedUrl(path = "") {
  return path && !path.startsWith(".") && !path.startsWith("http") && !path.startsWith("data:");
}

async function displayImageUrl(env, path) {
  if (!needsSignedUrl(path)) return path || "";
  try {
    return await createSignedStorageUrl(env, "trip-media", path);
  } catch (error) {
    console.warn("Avatar signing failed.", error);
    return path;
  }
}

async function signPostMedia(env, posts) {
  return Promise.all(
    posts.map(async (post) => {
      const authorAvatar = await displayImageUrl(env, post.author?.avatar_url);
      return {
        ...post,
        author: post.author ? { ...post.author, avatar_url: authorAvatar } : post.author,
        comments: await Promise.all(
          (post.comments || []).map(async (comment) => ({
            ...comment,
            author: comment.author
              ? { ...comment.author, avatar_url: await displayImageUrl(env, comment.author.avatar_url) }
              : comment.author,
          })),
        ),
        media: await Promise.all(
          (post.media || []).map(async (item) => {
            if (!needsSignedUrl(item.storage_path)) return item;
            try {
              return {
                ...item,
                original_storage_path: item.storage_path,
                storage_path: await createSignedStorageUrl(env, "trip-media", item.storage_path),
              };
            } catch (error) {
              console.warn("Media signing failed.", error);
              return item;
            }
          }),
        ),
      };
    }),
  );
}

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

  return json({ posts: await signPostMedia(context.env, posts) });
});
