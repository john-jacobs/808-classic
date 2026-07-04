import assert from "node:assert/strict";
import test from "node:test";

import { onRequestGet as health } from "../functions/api/health.js";
import { onRequestGet as tournament } from "../functions/api/tournament.js";
import { onRequestGet as feed } from "../functions/api/feed.js";
import { onRequestPost as createPost } from "../functions/api/posts.js";
import { onRequestPost as createWireDraft } from "../functions/api/wire-drafts.js";
import { supabaseRequest } from "../functions/_lib/supabase.js";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  SUPABASE_GROUP_ID: "group-1",
  SUPABASE_TRIP_ID: "trip-1",
};

function accessRequest(url, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("cf-access-authenticated-user-email", "john@example.com");
  return new Request(url, { ...init, headers });
}

function unsignedAccessToken(email) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ email })}.test-signature`;
}

test("modern Supabase secret keys are sent only through apikey", async () => {
  let requestHeaders;
  globalThis.fetch = async (_url, options) => {
    requestHeaders = options.headers;
    return new Response("[]", { status: 200 });
  };

  await supabaseRequest(env, "/rest/v1/groups?select=id");

  assert.equal(requestHeaders.get("apikey"), env.SUPABASE_SECRET_KEY);
  assert.equal(requestHeaders.get("authorization"), null);
});

test("health requires a Cloudflare Access identity", async () => {
  const response = await health({ request: new Request("https://example.com/api/health"), env });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Cloudflare Access identity is missing" });
});

test("health can resolve identity from the Access authorization cookie", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) {
      return Response.json([{ role: "owner" }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await health({
    request: new Request("https://example.com/api/health", {
      headers: { cookie: `CF_Authorization=${unsignedAccessToken("john@example.com")}` },
    }),
    env,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, member: "John" });
});

test("post creation derives tenant and author from the verified member", async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) {
      return Response.json([{ role: "owner" }]);
    }
    if (url.includes("/posts?")) {
      return Response.json([{ id: "post-1", body: "Opening dispatch" }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await createPost({
    request: accessRequest("https://example.com/api/posts", {
      method: "POST",
      body: JSON.stringify({
        body: "Opening dispatch",
        type: "dispatch",
        author_id: "spoofed-member",
        trip_id: "spoofed-trip",
      }),
    }),
    env,
  });

  assert.equal(response.status, 201);
  const insert = JSON.parse(calls.find((call) => call.url.includes("/posts?")).options.body);
  assert.equal(insert.author_id, "member-1");
  assert.equal(insert.group_id, "group-1");
  assert.equal(insert.trip_id, "trip-1");
});

test("tournament endpoint returns configured page data from Supabase", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "owner" }]);
    if (url.includes("/trips?")) return Response.json([{ id: "trip-1", year: 2026, name: "808 Classic 2026" }]);
    if (url.includes("/people?")) {
      return Response.json([{
        slug: "john-jacobs",
        display_name: "John Jacobs",
        handicap: 15.3,
        person_type: "current_player",
        sort_order: 1,
        active: true,
      }]);
    }
    if (url.includes("/tournament_participants?")) {
      return Response.json([{
        participant_type: "player",
        rank: 1,
        leaderboard_score: "E",
        handicap: 10,
        sort_order: 1,
        active: true,
        person: { slug: "john-jacobs", display_name: "John Jacobs" },
      }]);
    }
    if (url.includes("/content_sections?")) return Response.json([]);
    if (url.includes("/lodging_options?")) return Response.json([]);
    if (url.includes("/tournament_courses?")) return Response.json([]);
    if (url.includes("/itinerary_events?")) return Response.json([]);
    return new Response("Not found", { status: 404 });
  };

  const response = await tournament({ request: accessRequest("https://example.com/api/tournament"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.people[0].handicap, 15.3);
  assert.equal(body.classic_attendance[0].handicap, 10);
  assert.equal(body.classic_attendance[0].score, "E");
});

test("feed endpoint returns editorial fields and match metadata", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "owner" }]);
    if (url.includes("/posts?")) {
      return Response.json([{
        id: "post-1",
        type: "dispatch",
        headline: "Chuck Turns Back Arnaud",
        metadata: { result: { winner: "Charles Vokes", margin: 9 } },
        media: [{ storage_path: "./assets/wire/match.webp", sort_order: 0 }],
      }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await feed({ request: accessRequest("https://example.com/api/feed"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.posts[0].headline, "Chuck Turns Back Arnaud");
  assert.equal(body.posts[0].metadata.result.margin, 9);
});

test("wire draft generation sends full website context and all Wire posts to OpenAI", async () => {
  let openAiPayload;
  let postQuery = "";
  const allPosts = Array.from({ length: 7 }, (_, index) => ({
    id: `post-${index + 1}`,
    type: "dispatch",
    headline: `Wire post ${index + 1}`,
    dek: `Dek ${index + 1}`,
    body: `Body ${index + 1}`,
    metadata: { kind: "dispatch" },
    created_at: `2026-06-${String(index + 1).padStart(2, "0")}T12:00:00Z`,
  }));

  globalThis.fetch = async (url, options = {}) => {
    const href = String(url);
    if (href === "https://api.openai.com/v1/responses") {
      openAiPayload = JSON.parse(options.body);
      return Response.json({
        output_text: JSON.stringify({
          headline: "Draft headline",
          dek: "Draft dek",
          body: "Draft body",
          location: "Seattle",
          metadata: {
            kind: "dispatch",
            subject: "Context check",
            context_note: "",
            result: null,
            entities: [],
            scorecard: [],
            facts: [],
          },
          media_captions: [],
        }),
      });
    }
    if (href.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (href.includes("/group_memberships?")) return Response.json([{ role: "owner" }]);
    if (href.includes("/trips?")) return Response.json([{ id: "trip-1", name: "808 Classic 2026" }]);
    if (href.includes("/people?")) return Response.json([{ slug: "john", display_name: "John Jacobs", active: true }]);
    if (href.includes("/tournament_participants?")) {
      return Response.json([{ participant_type: "player", person: { slug: "john", display_name: "John Jacobs" } }]);
    }
    if (href.includes("/content_sections?")) return Response.json([{ section_key: "hero", title: "Hero", body: "Welcome copy" }]);
    if (href.includes("/lodging_options?")) return Response.json([{ name: "Ravenna House", detail: "Lodging detail" }]);
    if (href.includes("/tournament_courses?")) {
      return Response.json([{ day_label: "Friday", course: { name: "Jackson Park", description: "Course detail" } }]);
    }
    if (href.includes("/itinerary_events?")) return Response.json([{ title: "Opening round", blurb: "Event detail" }]);
    if (href.includes("/posts?")) {
      postQuery = href;
      return Response.json(allPosts);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await createWireDraft({
    request: accessRequest("https://example.com/api/wire-drafts", {
      method: "POST",
      body: JSON.stringify({ notes: "Write a dispatch that needs prior context." }),
    }),
    env: { ...env, OPENAI_API_KEY: "test-key" },
  });
  const body = await response.json();

  const prompt = JSON.parse(openAiPayload.input[1].content.find((part) => part.type === "input_text").text);

  assert.equal(response.status, 200);
  assert.equal(body.draft.headline, "Draft headline");
  assert.equal(prompt.app_context.site_copy[0].body, "Welcome copy");
  assert.equal(prompt.app_context.lodging[0].name, "Ravenna House");
  assert.equal(prompt.app_context.courses[0].course.name, "Jackson Park");
  assert.equal(prompt.app_context.events[0].title, "Opening round");
  assert.equal(prompt.app_context.wire_posts.length, 7);
  assert.equal(prompt.app_context.wire_posts[6].headline, "Wire post 7");
  assert.equal(prompt.app_context.recent_posts, undefined);
  assert.equal(postQuery.includes("limit=5"), false);
});
