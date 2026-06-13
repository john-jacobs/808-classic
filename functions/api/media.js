import { withApiErrors } from "../_lib/handler.js";
import { apiError, json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { requireActiveTripPost } from "../_lib/resource.js";
import { supabaseRequest, supabaseStorage } from "../_lib/supabase.js";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

const MAX_BYTES = 52_428_800; // 50 MB — matches trip-media bucket limit

// POST /api/media
// Upload a photo or video. Optionally attach it to an existing post via postId.
// Body: multipart/form-data with fields:
//   file     (required) — the file to upload
//   postId   (optional) — UUID of an existing post in the active trip
// Returns: { path, signedUrl, media }
export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);

  let formData;
  try {
    formData = await context.request.formData();
  } catch {
    return apiError(400, "Request must be multipart/form-data");
  }

  const file = formData.get("file");
  const postId = formData.get("postId") || null;

  if (!file || typeof file === "string") return apiError(400, "A file field is required");
  if (!ALLOWED_TYPES[file.type]) {
    return apiError(
      400,
      `Unsupported file type: ${file.type}. Allowed: ${Object.keys(ALLOWED_TYPES).join(", ")}`,
    );
  }
  if (file.size > MAX_BYTES) return apiError(400, "File exceeds the 50 MB limit");

  // Verify the post belongs to the active trip before uploading anything
  if (postId) await requireActiveTripPost(context.env, postId);

  const ext = ALLOWED_TYPES[file.type];
  const fileId = crypto.randomUUID();
  const storagePath = `${context.env.SUPABASE_TRIP_ID}/${member.id}/${fileId}.${ext}`;

  // Upload to the private trip-media bucket
  await supabaseStorage(context.env, `/object/trip-media/${storagePath}`, {
    method: "POST",
    headers: { "content-type": file.type, "x-upsert": "false" },
    body: await file.arrayBuffer(),
  });

  // Create a post_media record if a post was supplied
  let media = null;
  if (postId) {
    const existing = await supabaseRequest(
      context.env,
      `/rest/v1/post_media?post_id=eq.${postId}&select=sort_order&order=sort_order.desc&limit=1`,
    );
    const sortOrder = existing?.length ? (existing[0].sort_order ?? 0) + 1 : 0;

    const records = await supabaseRequest(context.env, "/rest/v1/post_media?select=*", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: {
        post_id: postId,
        storage_path: storagePath,
        mime_type: file.type,
        sort_order: sortOrder,
      },
    });
    media = records?.[0] ?? null;
  }

  // Return a 1-hour signed URL for immediate playback / preview
  const signed = await supabaseStorage(context.env, `/object/sign/trip-media/${storagePath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  return json(
    {
      path: storagePath,
      signedUrl: `${context.env.SUPABASE_URL}/storage/v1${signed.signedURL}`,
      media,
    },
    { status: 201 },
  );
});

// GET /api/media?path=<storagePath>
// Get a fresh 1-hour signed URL for an already-stored file.
// The feed API returns storage_path values; call this to get a playable URL.
export const onRequestGet = withApiErrors(async (context) => {
  await requireMember(context);

  const storagePath = new URL(context.request.url).searchParams.get("path");
  if (!storagePath) return apiError(400, "path query parameter is required");

  // Guard against accessing files from other trips
  if (!storagePath.startsWith(`${context.env.SUPABASE_TRIP_ID}/`)) {
    return apiError(403, "Path does not belong to the active trip");
  }

  const signed = await supabaseStorage(context.env, `/object/sign/trip-media/${storagePath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  return json({ signedUrl: `${context.env.SUPABASE_URL}/storage/v1${signed.signedURL}` });
});
