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
