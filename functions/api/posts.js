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
      id: String(item.id || "").trim(),
      storagePath: String(item.original_storage_path || item.storage_path || "").trim(),
      dataUrl: String(item.data_url || "").trim(),
      mimeType: String(item.type || "image/jpeg").trim().toLowerCase(),
      width: Number.isFinite(Number(item.width)) ? Number(item.width) : null,
      height: Number.isFinite(Number(item.height)) ? Number(item.height) : null,
      caption: String(item.caption || "").trim().slice(0, 240),
      sortOrder: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index,
      remove: item.remove === true,
    }))
    .filter((item) => {
      if (item.remove) return item.id || item.storagePath;
      if (item.dataUrl) return item.dataUrl.startsWith("data:image/") && item.dataUrl.length <= MAX_MEDIA_CHARS;
      return item.id || item.storagePath;
    });
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

function canonicalMediaPath(item = {}) {
  return String(item.original_storage_path || item.storagePath || item.storage_path || "").trim();
}

async function reconcilePostMedia(context, post, media, metadata = {}) {
  const existingRows = await supabaseRequest(
    context.env,
    `/rest/v1/post_media?post_id=eq.${encodeURIComponent(post.id)}&select=*&order=sort_order.asc`,
  );
  const existingById = new Map((existingRows || []).map((item) => [String(item.id), item]));
  const keepIds = new Set();
  const mediaCaptions = { ...(metadata.media_captions || {}) };

  for (const item of media) {
    if (item.remove) continue;

    if (item.dataUrl) {
      const parsed = parseDataUrl(item.dataUrl);
      if (!parsed) continue;

      const extension = fileExtension(parsed.mimeType || item.mimeType);
      const storagePath = `${context.env.SUPABASE_GROUP_ID}/${context.env.SUPABASE_TRIP_ID}/posts/${post.id}/${String(item.sortOrder).padStart(2, "0")}-${crypto.randomUUID()}.${extension}`;
      await uploadStorageObject(context.env, "trip-media", storagePath, parsed.bytes, parsed.mimeType);
      const rows = await supabaseRequest(context.env, "/rest/v1/post_media?select=*", {
        method: "POST",
        headers: { prefer: "return=representation" },
        body: [
          {
            post_id: post.id,
            storage_path: storagePath,
            mime_type: parsed.mimeType,
            width: item.width,
            height: item.height,
            sort_order: item.sortOrder,
          },
        ],
      });
      const newRow = rows?.[0];
      if (newRow?.id) keepIds.add(String(newRow.id));
      if (item.caption) mediaCaptions[storagePath] = item.caption;
      continue;
    }

    const existing = existingById.get(item.id) || existingRows.find((row) => row.storage_path === item.storagePath);
    if (!existing) continue;
    keepIds.add(String(existing.id));
    await supabaseRequest(context.env, `/rest/v1/post_media?id=eq.${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: {
        sort_order: item.sortOrder,
        width: item.width || existing.width,
        height: item.height || existing.height,
      },
    });

    const storagePath = canonicalMediaPath(item) || existing.storage_path;
    if (storagePath) {
      if (item.caption) mediaCaptions[storagePath] = item.caption;
      else delete mediaCaptions[storagePath];
    }
  }

  const idsToDelete = (existingRows || [])
    .map((item) => String(item.id))
    .filter((id) => !keepIds.has(id));

  for (const id of idsToDelete) {
    await supabaseRequest(context.env, `/rest/v1/post_media?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { prefer: "return=minimal" },
    });
  }

  for (const row of existingRows || []) {
    if (idsToDelete.includes(String(row.id))) delete mediaCaptions[row.storage_path];
  }

  return {
    ...metadata,
    media_captions: mediaCaptions,
  };
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
  const rawInput = await readJson(context.request);
  const input = cleanPostInput(rawInput);
  const media = cleanMedia(rawInput);
  const merged = {
    ...input,
    metadata: Object.keys(input.metadata).length ? input.metadata : existing.metadata || {},
    publishedAt: input.publishedAt || existing.published_at,
  };

  const error = validatePostInput(merged, member);
  if (error) return apiError(error.startsWith("Only") ? 403 : 400, error);

  const metadata = rawInput.media ? await reconcilePostMedia(context, existing, media, merged.metadata) : merged.metadata;

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
      metadata,
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
