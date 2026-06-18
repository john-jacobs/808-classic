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

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const body = String(input.body || "").trim();
  const type = POST_TYPES.has(input.type) ? input.type : "dispatch";
  const headline = String(input.headline || "").trim();
  const dek = String(input.dek || "").trim();
  const byline = String(input.byline || "").trim();
  const location = String(input.location || "").trim();
  const publishedAt = String(input.published_at || "").trim() || new Date().toISOString();
  const metadata = input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {};
  const media = cleanMedia(input);

  if (!body && type !== "photo") return apiError(400, "A post needs text or a photo");
  if (body.length > 5000) return apiError(400, "Post text must be 5,000 characters or fewer");
  if (headline.length > 160) return apiError(400, "Headline must be 160 characters or fewer");
  if (dek.length > 260) return apiError(400, "Dek must be 260 characters or fewer");
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
      headline,
      dek,
      byline: byline || "808 Wire Staff",
      location,
      published_at: publishedAt,
      metadata,
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
      ...metadata,
      media_captions: {
        ...(metadata.media_captions || {}),
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
