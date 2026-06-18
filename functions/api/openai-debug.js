import { json } from "../_lib/http.js";

function present(value) {
  return Boolean(String(value || "").trim());
}

function keyShape(value) {
  const key = String(value || "").trim();
  if (!key) return "missing";
  if (key.startsWith("sk-")) return "looks_like_openai_key";
  return "present_but_unexpected_prefix";
}

async function safeFetchOpenAI(env) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        authorization: `Bearer ${String(env.OPENAI_API_KEY || "").trim()}`,
      },
    });
    const text = await response.text();
    let message = text.slice(0, 240);
    try {
      const data = JSON.parse(text);
      message = data.error?.message || data.data?.[0]?.id || message;
    } catch {
      // Keep the text preview.
    }
    return {
      ok: response.ok,
      status: response.status,
      content_type: response.headers.get("content-type"),
      message,
    };
  } catch (error) {
    return {
      ok: false,
      thrown: error.message,
    };
  }
}

export const onRequestGet = async (context) => {
  const openai = await safeFetchOpenAI(context.env);
  return json({
    ok: openai.ok,
    env: {
      openai_api_key: keyShape(context.env.OPENAI_API_KEY),
      openai_model: context.env.OPENAI_MODEL || "gpt-5.5",
      supabase_url: present(context.env.SUPABASE_URL),
      supabase_secret_key: present(context.env.SUPABASE_SECRET_KEY),
      supabase_group_id: present(context.env.SUPABASE_GROUP_ID),
      supabase_trip_id: present(context.env.SUPABASE_TRIP_ID),
    },
    openai,
  });
};
