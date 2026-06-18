import { json } from "../_lib/http.js";

function parseMaybeJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function summarizeResponse(response, text) {
  const data = parseMaybeJson(text);
  const outputText =
    data.output_text ||
    (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((content) => content.type === "output_text")
      .map((content) => content.text)
      .join("\n");

  return {
    ok: response.ok,
    status: response.status,
    content_type: response.headers.get("content-type"),
    error: data.error?.message || null,
    output_text: outputText || null,
    raw_start: data.raw ? data.raw.slice(0, 240) : null,
  };
}

async function callResponses(env, body) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${String(env.OPENAI_API_KEY || "").trim()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return summarizeResponse(response, text);
}

export const onRequestGet = async (context) => {
  const model = context.env.OPENAI_MODEL || "gpt-5.5";
  const plain = await callResponses(context.env, {
    model,
    input: "Reply with exactly: OK",
    max_output_tokens: 16,
  });

  let structured = null;
  if (plain.ok) {
    structured = await callResponses(context.env, {
      model,
      input: "Return a one-word status.",
      max_output_tokens: 64,
      text: {
        format: {
          type: "json_schema",
          name: "status_check",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["status"],
            properties: {
              status: { type: "string" },
            },
          },
        },
      },
    });
  }

  return json({
    ok: Boolean(plain.ok && (!structured || structured.ok)),
    model,
    plain,
    structured,
  });
};
