import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";

function parseMaybeJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const model = context.env.OPENAI_MODEL || "gpt-5.5";

  if (!context.env.OPENAI_API_KEY) {
    throw Object.assign(new Error("Missing OPENAI_API_KEY"), { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${context.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: "Reply with exactly: OK",
      max_output_tokens: 16,
    }),
  });

  const text = await response.text();
  const data = parseMaybeJson(text);

  if (!response.ok) {
    const message = data.error?.message || data.raw?.slice(0, 240) || "OpenAI health check failed";
    throw Object.assign(new Error(message), { status: 502 });
  }

  return json({
    ok: true,
    member: member.display_name,
    model,
    openai_status: response.status,
  });
});
