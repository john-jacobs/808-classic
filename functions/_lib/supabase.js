const REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_GROUP_ID", "SUPABASE_TRIP_ID"];

export function assertBackendEnv(env) {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing backend environment variables: ${missing.join(", ")}`);
}

export async function supabaseRequest(env, path, options = {}) {
  assertBackendEnv(env);

  const headers = new Headers(options.headers || {});
  headers.set("apikey", env.SUPABASE_SECRET_KEY);
  if (!env.SUPABASE_SECRET_KEY.startsWith("sb_secret_")) {
    headers.set("authorization", `Bearer ${env.SUPABASE_SECRET_KEY}`);
  }
  if (options.body !== undefined) headers.set("content-type", "application/json");

  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.message || data?.error_description || data?.hint || `Supabase request failed: ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

function storageObjectUrl(env, bucket, path) {
  const baseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
}

export async function uploadStorageObject(env, bucket, path, bytes, mimeType) {
  assertBackendEnv(env);

  const response = await fetch(storageObjectUrl(env, bucket, path), {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "content-type": mimeType,
      "x-upsert": "true",
    },
    body: bytes,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Storage upload failed: ${response.status}`);
  }
  return data;
}

export async function createSignedStorageUrl(env, bucket, path, expiresIn = 60 * 60 * 24) {
  assertBackendEnv(env);

  const response = await fetch(`${storageObjectUrl(env, bucket, path).replace("/object/", "/object/sign/")}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ expiresIn }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Signed URL creation failed: ${response.status}`);
  }

  const signedUrl = data?.signedURL || data?.signedUrl || "";
  if (signedUrl.startsWith("http")) return signedUrl;

  const baseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  if (signedUrl.startsWith("/storage/v1/")) return `${baseUrl}${signedUrl}`;
  if (signedUrl.startsWith("/object/")) return `${baseUrl}/storage/v1${signedUrl}`;
  return `${baseUrl}/storage/v1/${signedUrl.replace(/^\//, "")}`;
}
