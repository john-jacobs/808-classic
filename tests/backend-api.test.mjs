import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";

// crypto and File are globals in Cloudflare Workers and Node 20+. Polyfill for Node 18.
if (typeof crypto === "undefined") global.crypto = webcrypto;
if (typeof File === "undefined") {
  global.File = class File extends Blob {
    constructor(chunks, name, options = {}) {
      super(chunks, options);
      this.name = name;
    }
  };
}

import { onRequestGet as health } from "../functions/api/health.js";
import { onRequestGet as tournament } from "../functions/api/tournament.js";
import { onRequestGet as feed } from "../functions/api/feed.js";
import { onRequestPost as createPost } from "../functions/api/posts.js";
import { onRequestPost as uploadMedia, onRequestGet as getMedia } from "../functions/api/media.js";
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

test("media upload rejects unsupported file types", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const form = new FormData();
  form.append("file", new File(["data"], "clip.gif", { type: "image/gif" }));

  const response = await uploadMedia({
    request: accessRequest("https://example.com/api/media", { method: "POST", body: form }),
    env,
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(body.error.includes("Unsupported file type"));
});

test("media upload rejects files over 50 MB", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const bigFile = new File([new Uint8Array(52_428_801)], "big.mp4", { type: "video/mp4" });
  const form = new FormData();
  form.append("file", bigFile);

  const response = await uploadMedia({
    request: accessRequest("https://example.com/api/media", { method: "POST", body: form }),
    env,
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "File exceeds the 50 MB limit" });
});

test("media upload stores file and returns a signed URL", async () => {
  const uploadedPaths = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/storage/v1/object/trip-media/")) {
      uploadedPaths.push(url);
      return Response.json({ Key: "trip-media/path/file.mp4" });
    }
    if (url.includes("/storage/v1/object/sign/")) {
      return Response.json({ signedURL: "/object/sign/trip-media/path/file.mp4?token=abc" });
    }
    return new Response("Not found", { status: 404 });
  };

  const form = new FormData();
  form.append("file", new File(["video-data"], "round.mp4", { type: "video/mp4" }));

  const response = await uploadMedia({
    request: accessRequest("https://example.com/api/media", { method: "POST", body: form }),
    env,
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.ok(body.path.endsWith(".mp4"), "storage path should have .mp4 extension");
  assert.ok(body.signedUrl.includes("token=abc"), "response should include signed URL");
  assert.equal(body.media, null, "media record should be null when no postId provided");
  assert.equal(uploadedPaths.length, 1, "should have uploaded exactly one file");
});

test("media upload attaches file to a post and sets sort_order", async () => {
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/posts?")) return Response.json([{ id: "post-1" }]);
    if (url.includes("/storage/v1/object/trip-media/")) return Response.json({ Key: "ok" });
    if (url.includes("/storage/v1/object/sign/")) {
      return Response.json({ signedURL: "/object/sign/trip-media/x?token=xyz" });
    }
    if (url.includes("/post_media?post_id") && options?.method !== "POST") {
      return Response.json([{ sort_order: 1 }]); // one existing item
    }
    if (url.includes("/post_media?") && options?.method === "POST") {
      const inserted = JSON.parse(options.body);
      return Response.json([{ ...inserted, id: "media-1" }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const form = new FormData();
  form.append("file", new File(["img"], "photo.jpg", { type: "image/jpeg" }));
  form.append("postId", "post-1");

  const response = await uploadMedia({
    request: accessRequest("https://example.com/api/media", { method: "POST", body: form }),
    env,
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.media.post_id, "post-1");
  assert.equal(body.media.sort_order, 2); // existing max was 1, next is 2
});

test("media upload rejects postId that does not belong to the active trip", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/posts?")) return Response.json([]); // post not found in active trip
    return new Response("Not found", { status: 404 });
  };

  const form = new FormData();
  form.append("file", new File(["img"], "photo.jpg", { type: "image/jpeg" }));
  form.append("postId", "foreign-post-id");

  const response = await uploadMedia({
    request: accessRequest("https://example.com/api/media", { method: "POST", body: form }),
    env,
  });

  assert.equal(response.status, 404);
});

test("GET /api/media returns a signed URL for an active-trip path", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/storage/v1/object/sign/")) {
      return Response.json({ signedURL: "/object/sign/trip-media/trip-1/member-1/file.mp4?token=def" });
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await getMedia({
    request: accessRequest(`https://example.com/api/media?path=trip-1/member-1/file.mp4`),
    env,
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.signedUrl.includes("token=def"));
});

test("GET /api/media rejects a path from a different trip", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await getMedia({
    request: accessRequest(`https://example.com/api/media?path=other-trip-id/member-1/file.mp4`),
    env,
  });

  assert.equal(response.status, 403);
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
