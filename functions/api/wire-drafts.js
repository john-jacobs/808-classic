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
      description: "Place, city, course, venue, or general setting for the dispatch. Leave empty if the submission does not establish one.",
    },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "subject", "context_note", "result", "entities", "scorecard", "facts"],
      properties: {
        kind: {
          type: "string",
          enum: [
            "match_report",
            "match_preview",
            "practice_report",
            "scouting_report",
            "score_update",
            "rumor_mill",
            "photo_drop",
            "photo_essay",
            "logistics",
            "official_notice",
            "daily_recap",
            "dispatch",
          ],
          description: "Semantic Wire label. Use match_report only after a completed match/round; use match_preview before it happens.",
        },
        subject: {
          type: "string",
          description: "The central subject of the dispatch, such as a match, person, quote, travel issue, ruling, photo set, logistics item, or general trip storyline.",
        },
        context_note: {
          type: "string",
          description: "Optional background note relevant to the story. This can be course history for match content, but can also be travel context, prior form, group lore, or an empty string.",
        },
        result: {
          type: ["object", "null"],
          additionalProperties: false,
          required: ["label", "summary", "winner", "margin"],
          properties: {
            label: {
              type: "string",
              description: "Short result label, such as Final, Update, Decision, or Outcome.",
            },
            summary: {
              type: "string",
              description: "Human-readable outcome summary. Leave empty only when result is null.",
            },
            winner: {
              type: "string",
              description: "Winner or prevailing side when there is one; otherwise an empty string.",
            },
            margin: { type: ["number", "null"] },
          },
        },
        entities: {
          type: "array",
          description: "People, groups, places, objects, or named story elements worth identifying outside the article body. Use an empty array when the story does not need this structure.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "role", "note"],
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              note: { type: "string" },
            },
          },
        },
        scorecard: {
          type: "array",
          description: "Only include rows when the submitted material supports actual score data. Use an empty array for non-match dispatches, previews without scores, photo drops, logistics, rumors, rulings, or general updates.",
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
        facts: {
          type: "array",
          description: "Small structured facts worth surfacing outside the story, such as time, place, status, quote source, travel detail, ruling, stat, or matchup note.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "value"],
            properties: {
              label: { type: "string" },
              value: { type: "string" },
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

function parseMaybeJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
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
    location_or_context: cleanString(input.location, 240),
    outcome_or_details: cleanString(input.result, 1000),
    image_notes: images.map(({ index, name, caption }) => ({ index, name, caption })),
    revision_notes: cleanString(input.revision, 2500),
    previous_draft: input.previousDraft && typeof input.previousDraft === "object" ? input.previousDraft : null,
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
          editorial_priority:
            "The submitted notes are the primary source. Use attached images as supporting evidence. The Wire can cover matches, previews, rumors, logistics, rulings, travel, photos, daily recaps, people, quotes, and other trip storylines. Analyze scorecards, stat screenshots, and golf data carefully when present. For ordinary photos, do not make visible details the main story unless the notes explicitly ask for a photo-driven post; use them mainly for captions, atmosphere, and verification.",
          available_kinds:
            "Choose metadata.kind from: match_report, match_preview, practice_report, scouting_report, score_update, rumor_mill, photo_drop, photo_essay, logistics, official_notice, daily_recap, dispatch. Use match_report only for a completed match/round with a result. Use match_preview for an upcoming matchup or pre-round setup.",
          voice:
            "Write like an actual sports dispatch for a private golf trip: game story, beat report, notebook, preview, recap, or column. Funny, dry, specific, observant, and self-deprecating toward the people involved. The humor should come from treating mediocre friend golf, fragile confidence, bad swings, group-chat quotes, tiny rivalries, and questionable decisions with real sports-page attention. Roast the players affectionately using the submitted facts when players are actually part of the story; do not be mean, generic, or sanitized. Ground the article in the submitted stakes, form, matchups, pressure, swings, scoring, course conditions, logistics, quotes, and character that are actually present. Avoid committee, bureaucracy, municipal, corporate, governance, department, jurisdiction, delegation, operations, or officialdom language unless the submitted notes explicitly ask for that joke. Preserve real details, avoid punching down, avoid slurs, do not invent scores, and mark unknown numeric score fields as null.",
          metadata_rules:
            "Use metadata.subject and metadata.context_note for general story context. Do not force a golf course into metadata.subject or metadata.context_note unless the submission is actually course-centered. Use metadata.result only when there is a real outcome, decision, final score, or status update; otherwise set it to null. Use metadata.entities only for people, groups, places, objects, or named story elements worth identifying outside the body; otherwise use an empty array. Use metadata.scorecard only for actual score rows; otherwise use an empty array. Use metadata.facts for compact supporting details that are true from the notes.",
          output_rules:
            "Return only the requested JSON shape. Use blank lines between article paragraphs. Keep body under 5000 characters. Do not default to match_report. Let the notes determine the story and metadata.kind. Generate useful media_captions by image index. For non-scorecard photos, captions should identify the image without letting the photo overtake the article. If previous_draft and revision_notes are provided, revise the previous draft instead of starting over. Do not imitate bureaucratic wording from prior posts or site copy; use prior posts for facts and continuity only.",
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
            "You are the editor of The 808 Wire, a private golf-trip sports publication for the 808 Classic. You transform messy group-chat facts, scorecards, and photos into sharp sportswriting: reported, funny, concrete, specific, and affectionately self-deprecating. The joke is that a friend golf trip full of flawed players is being covered like a real beat, not that it has a fake committee or municipal government.",
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
  const data = parseMaybeJson(text);
  if (!response.ok) {
    const message = data.error?.message || data.raw?.slice(0, 240) || "OpenAI draft generation failed";
    throw Object.assign(new Error(message), { status: 502 });
  }

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
