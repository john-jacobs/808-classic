import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

const MAX_IMAGES = 6;
const MAX_IMAGE_CHARS = 4_500_000;

const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "dek", "body", "location", "metadata", "media_captions"],
  properties: {
    headline: {
      type: "string",
      description: "Punchy 808 Wire headline, usually with the result if there is one.",
    },
    dek: {
      type: "string",
      description: "One sentence standfirst that tees up the joke and the stakes.",
    },
    body: {
      type: "string",
      description: "Full article body as 4 to 7 paragraphs separated by blank lines.",
    },
    location: {
      type: "string",
      description: "Course, city, or setting for the dispatch.",
    },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "course", "course_note", "result", "scorecard"],
      properties: {
        kind: { type: "string" },
        course: { type: "string" },
        course_note: { type: "string" },
        result: {
          type: "object",
          additionalProperties: false,
          required: ["winner", "winner_total", "runner_up", "runner_up_total", "margin"],
          properties: {
            winner: { type: "string" },
            winner_total: { type: ["number", "null"] },
            runner_up: { type: "string" },
            runner_up_total: { type: ["number", "null"] },
            margin: { type: ["number", "null"] },
          },
        },
        scorecard: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "front", "back", "total", "to_par"],
            properties: {
              name: { type: "string" },
              front: { type: ["number", "null"] },
              back: { type: ["number", "null"] },
              total: { type: ["number", "null"] },
              to_par: { type: "string" },
            },
          },
        },
      },
    },
    media_captions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "caption"],
        properties: {
          index: { type: "number" },
          caption: { type: "string" },
        },
      },
    },
  },
};

function cleanString(value, max = 8000) {
  return String(value || "").trim().slice(0, max);
}

function extractOutputText(response) {
  if (response.output_text) return response.output_text;
  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

async function maybeFetchContext(env) {
  try {
    const [people, courses, posts] = await Promise.all([
      supabaseRequest(
        env,
        `/rest/v1/people?group_id=eq.${env.SUPABASE_GROUP_ID}&active=eq.true&select=display_name,title,city,bio,quote,strength,weakness,person_type,tournament_participants!inner(participant_type,handicap,odds,classic_record,leaderboard_score,detail)&tournament_participants.trip_id=eq.${env.SUPABASE_TRIP_ID}&order=sort_order.asc`,
      ),
      supabaseRequest(
        env,
        `/rest/v1/tournament_courses?trip_id=eq.${env.SUPABASE_TRIP_ID}&active=eq.true&select=day_label,tee_time_notes,courses(name,address,description)&order=sort_order.asc`,
      ),
      supabaseRequest(
        env,
        `/rest/v1/posts?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=headline,dek,body,metadata,created_at&order=created_at.desc&limit=5`,
      ),
    ]);
    return { people, courses, recent_posts: posts };
  } catch (error) {
    console.warn("Wire draft context lookup failed.", error);
    return { people: [], courses: [], recent_posts: [] };
  }
}

async function generateWireDraft(env, input, member, contextData) {
  if (!env.OPENAI_API_KEY) throw Object.assign(new Error("Missing OPENAI_API_KEY"), { status: 500 });

  const images = (Array.isArray(input.images) ? input.images : [])
    .slice(0, MAX_IMAGES)
    .map((image, index) => ({
      index,
      name: cleanString(image.name, 120),
      caption: cleanString(image.caption, 300),
      data_url: cleanString(image.data_url, MAX_IMAGE_CHARS + 20),
    }))
    .filter((image) => image.data_url.startsWith("data:image/") && image.data_url.length <= MAX_IMAGE_CHARS);

  const userText = {
    notes: cleanString(input.notes, 9000),
    course_or_location: cleanString(input.location, 240),
    score_or_result: cleanString(input.result, 1000),
    image_notes: images.map(({ index, name, caption }) => ({ index, name, caption })),
  };

  if (!userText.notes && !images.length) throw Object.assign(new Error("Add notes or at least one image"), { status: 400 });

  const content = [
    {
      type: "input_text",
      text: JSON.stringify(
        {
          assignment: "Draft an 808 Wire article from the submitted raw material.",
          author: member.display_name,
          raw_submission: userText,
          app_context: contextData,
          voice:
            "Overly official golf-trip journalism. Funny, dry, specific, and lightly grandiose. Preserve real details, avoid punching down, avoid slurs, do not invent scores, and mark unknown numeric score fields as null.",
          output_rules:
            "Return only the requested JSON shape. Use blank lines between article paragraphs. Keep body under 5000 characters. Prefer dispatch/match_report as metadata.kind.",
        },
        null,
        2,
      ),
    },
    ...images.map((image) => ({
      type: "input_image",
      image_url: image.data_url,
      detail: "auto",
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are the editor of The 808 Wire, a private golf-trip publication for the 808 Classic. You transform messy group-chat facts, scorecards, and photos into polished but absurdly serious tournament journalism.",
        },
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wire_article_draft",
          strict: true,
          schema: ARTICLE_SCHEMA,
        },
      },
    }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw Object.assign(new Error(data.error?.message || "OpenAI draft generation failed"), { status: 502 });

  const outputText = extractOutputText(data);
  if (!outputText) throw Object.assign(new Error("OpenAI returned an empty draft"), { status: 502 });

  return JSON.parse(outputText);
}

export const onRequestPost = withApiErrors(async (context) => {
  const member = await requireMember(context);
  const input = await readJson(context.request);
  const contextData = await maybeFetchContext(context.env);
  const draft = await generateWireDraft(context.env, input, member, contextData);

  return json({
    draft: {
      ...draft,
      byline: "808 Wire Staff",
      type: "dispatch",
      published_at: new Date().toISOString(),
    },
  });
});
