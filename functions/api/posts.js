import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest, uploadStorageObject } from "../_lib/supabase.js";

const POST_TYPES = new Set(["dispatch", "photo", "score_update", "official_notice", "rules_dispute"]);
const MAX_MEDIA = 6;
const MAX_MEDIA_CHARS = 4_500_000;

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    bytes: Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0)),
  };
}

function fileExtension(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function cleanMedia(input) {
  return (Array.isArray(input.media) ? input.media : [])
    .slice(0, MAX_MEDIA)
    .map((item, index) => ({
      dataUrl: String(item.data_url || "").trim(),
      mimeType: String(item.type || "image/jpeg").trim().toLowerCase(),
      width: Number.isFinite(Number(item.width)) ? Number(item.width) : null,
      height: Number.isFinite(Number(item.height)) ? Number(item.height) : null,
      caption: String(item.caption || "").trim().slice(0, 240),
      sortOrder: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index,
    }))
    .filter((item) => item.dataUrl.startsWith("data:image/") && item.dataUrl.length <= MAX_MEDIA_CHARS);
}

function cleanPostInput(input) {
  return {
    body: String(input.body || "").trim(),
    type: POST_TYPES.has(input.type) ? input.type : "dispatch",
    headline: String(input.headline || "").trim(),
    dek: String(input.dek || "").trim(),
    byline: String(input.byline || "").trim(),
    location: String(input.location || "").trim(),
    publishedAt: String(input.published_at || "").trim(),
    metadata: input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {},
  };
}

function validatePostInput(input, member) {
  if (!input.body && input.type !== "photo") return "A post needs text or a photo";
  if (input.body.length > 5000) return "Post text must be 5,000 characters or fewer";
  if (input.headline.length > 160) return "Headline must be 160 characters or fewer";
  if (input.dek.length > 260) return "Dek must be 260 characters or fewer";
  if (input.type === "official_notice" && !["owner", "admin"].includes(member.role)) {
    return "Only group admins can publish official notices";
  }
  return "";
}

async function findEditablePost(context, member, postId) {
  if (!postId) throw Object.assign(new Error("post id is required"), { status: 400 });
  const posts = await supabaseRequest(
    context.env,
    `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&trip_id=eq.${context.env.SUPABASE_TRIP_ID}&select=*&limit=1`,
  );
  const post = posts?.[0];
  if (!post) throw Object.assign(new Error("Post not found"), { status: 404 });
  if (post.author_id !== member.id && !["owner", "admin"].includes(member.role)) {
    throw Object.assign(new Error("Only the author or a group admin can manage this post"), { status: 403 });
  }
  return post;
}

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const postInput = cleanPostInput(input);
  const publishedAt = postInput.publishedAt || new Date().toISOString();
  const media = cleanMedia(input);

  const error = validatePostInput(postInput, member);
  if (error) return apiError(error.startsWith("Only") ? 403 : 400, error);

  const posts = await supabaseRequest(context.env, "/rest/v1/posts?select=*", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: {
      group_id: context.env.SUPABASE_GROUP_ID,
      trip_id: context.env.SUPABASE_TRIP_ID,
      author_id: member.id,
      type: postInput.type,
      body: postInput.body,
      headline: postInput.headline,
      dek: postInput.dek,
      byline: postInput.byline || "808 Wire Staff",
      location: postInput.location,
      published_at: publishedAt,
      metadata: postInput.metadata,
    },
  });

  const post = posts[0];
  const mediaRows = [];
  const mediaCaptions = {};
  for (const item of media) {
    const parsed = parseDataUrl(item.dataUrl);
    if (!parsed) continue;

    const extension = fileExtension(parsed.mimeType || item.mimeType);
    const storagePath = `${context.env.SUPABASE_GROUP_ID}/${context.env.SUPABASE_TRIP_ID}/posts/${post.id}/${String(item.sortOrder).padStart(2, "0")}-${crypto.randomUUID()}.${extension}`;
    await uploadStorageObject(context.env, "trip-media", storagePath, parsed.bytes, parsed.mimeType);
    mediaRows.push({
      post_id: post.id,
      storage_path: storagePath,
      mime_type: parsed.mimeType,
      width: item.width,
      height: item.height,
      sort_order: item.sortOrder,
    });
    if (item.caption) mediaCaptions[storagePath] = item.caption;
  }

  if (mediaRows.length) {
    await supabaseRequest(context.env, "/rest/v1/post_media", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: mediaRows,
    });
  }

  if (Object.keys(mediaCaptions).length) {
    post.metadata = {
      ...postInput.metadata,
      media_captions: {
        ...(postInput.metadata.media_captions || {}),
        ...mediaCaptions,
      },
    };
    await supabaseRequest(context.env, `/rest/v1/posts?id=eq.${post.id}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: { metadata: post.metadata },
    });
  }

  return json({ post: { ...post, media: mediaRows } }, { status: 201 });
});

export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const postId = new URL(context.request.url).searchParams.get("id");
  const existing = await findEditablePost(context, member, postId);
  const input = cleanPostInput(await readJson(context.request));
  const merged = {
    ...input,
    metadata: Object.keys(input.metadata).length ? input.metadata : existing.metadata || {},
    publishedAt: input.publishedAt || existing.published_at,
  };

  const error = validatePostInput(merged, member);
  if (error) return apiError(error.startsWith("Only") ? 403 : 400, error);

  const posts = await supabaseRequest(context.env, `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&select=*`, {
    method: "PATCH",
    headers: { prefer: "return=representation" },
    body: {
      type: merged.type,
      body: merged.body,
      headline: merged.headline,
      dek: merged.dek,
      byline: merged.byline || "808 Wire Staff",
      location: merged.location,
      published_at: merged.publishedAt,
      metadata: merged.metadata,
      updated_at: new Date().toISOString(),
    },
  });

  return json({ post: posts[0] });
});

export const onRequestDelete = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const postId = new URL(context.request.url).searchParams.get("id");
  await findEditablePost(context, member, postId);
  await supabaseRequest(context.env, `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: { prefer: "return=minimal" },
  });
  return json({ ok: true });
});
