import assert from "node:assert/strict";
import test from "node:test";

import { onRequestGet as health } from "../functions/api/health.js";
import { onRequestGet as tournament } from "../functions/api/tournament.js";
import { onRequestGet as feed } from "../functions/api/feed.js";
import { onRequestPost as createPost } from "../functions/api/posts.js";
import {
  onRequestGet as listMembers,
  onRequestPost as addMember,
  onRequestPatch as patchMember,
  onRequestDelete as deleteMember,
} from "../functions/api/members.js";
import { onRequestGet as getProfile, onRequestPatch as patchProfile } from "../functions/api/profile.js";
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

// ── GET /api/members ──────────────────────────────────────────────────────────

test("GET /api/members as member returns only themselves", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await listMembers({ request: accessRequest("https://example.com/api/members"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.members.length, 1);
  assert.equal(body.members[0].email, "john@example.com");
  assert.equal(body.members[0].role, "member");
});

test("GET /api/members as admin returns all group members with roles", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?select=id,email") && url.includes("id=in.")) {
      return Response.json([
        { id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null },
        { id: "member-2", email: "evan@example.com", display_name: "Evan", avatar_url: null },
      ]);
    }
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?select=member_id,role")) {
      return Response.json([
        { member_id: "member-1", role: "admin" },
        { member_id: "member-2", role: "member" },
      ]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "admin" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await listMembers({ request: accessRequest("https://example.com/api/members"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.members.length, 2);
  assert.equal(body.members.find((m) => m.email === "evan@example.com")?.role, "member");
});

// ── POST /api/members ─────────────────────────────────────────────────────────

test("POST /api/members as admin adds a new member", async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.includes("/members?select=id,email")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/members?") && options.method !== "POST") {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?") && !url.includes("select=member_id")) {
      return Response.json([{ role: "admin" }]);
    }
    if (url.includes("/members?select=id") && options?.method === "POST") {
      return Response.json([{ id: "new-member-id" }]);
    }
    if (url.includes("/group_memberships?on_conflict=")) {
      return new Response(null, { status: 201 });
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await addMember({
    request: accessRequest("https://example.com/api/members", {
      method: "POST",
      body: JSON.stringify({ email: "newguy@example.com", display_name: "New Guy", role: "member" }),
    }),
    env,
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.member.email, "newguy@example.com");
  assert.equal(body.member.role, "member");
});

test("POST /api/members as non-admin is forbidden", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await addMember({
    request: accessRequest("https://example.com/api/members", {
      method: "POST",
      body: JSON.stringify({ email: "hack@example.com", display_name: "Hacker", role: "owner" }),
    }),
    env,
  });

  assert.equal(response.status, 403);
});

// ── PATCH /api/members ────────────────────────────────────────────────────────

test("PATCH /api/members as admin updates another member's role", async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?select=role")) return Response.json([{ role: "admin" }]);
    if (url.includes("/group_memberships?member_id=") && options?.method === "PATCH") {
      return new Response(null, { status: 204 });
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await patchMember({
    request: accessRequest("https://example.com/api/members?id=member-2", {
      method: "PATCH",
      body: JSON.stringify({ role: "member" }),
    }),
    env,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const roleCall = calls.find((c) => c.url.includes("/group_memberships?member_id=") && c.options?.method === "PATCH");
  assert.ok(roleCall, "should have patched group_memberships");
  assert.equal(JSON.parse(roleCall.options.body).role, "member");
});

test("PATCH /api/members as member can update own display_name but not role", async () => {
  const memberCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?") && options?.method === "PATCH") memberCalls.push(options);
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response(null, { status: 204 });
  };

  const response = await patchMember({
    request: accessRequest("https://example.com/api/members", {
      method: "PATCH",
      body: JSON.stringify({ display_name: "John Updated", role: "admin" }),
    }),
    env,
  });

  // role update should be blocked for non-admin
  assert.equal(response.status, 403);
});

test("PATCH /api/members as member updates own display_name when no role change requested", async () => {
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response(null, { status: 204 });
  };

  const response = await patchMember({
    request: accessRequest("https://example.com/api/members", {
      method: "PATCH",
      body: JSON.stringify({ display_name: "John Updated" }),
    }),
    env,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

// ── DELETE /api/members ───────────────────────────────────────────────────────

test("DELETE /api/members as owner removes group membership", async () => {
  let deleted = false;
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?select=role")) return Response.json([{ role: "owner" }]);
    if (url.includes("/group_memberships?member_id=") && options?.method === "DELETE") {
      deleted = true;
      return new Response(null, { status: 204 });
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await deleteMember({
    request: accessRequest("https://example.com/api/members?id=member-2", { method: "DELETE" }),
    env,
  });

  assert.equal(response.status, 200);
  assert.equal(deleted, true);
});

test("DELETE /api/members as admin is forbidden", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "admin" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await deleteMember({
    request: accessRequest("https://example.com/api/members?id=member-2", { method: "DELETE" }),
    env,
  });

  assert.equal(response.status, 403);
});

// ── GET /api/profile ──────────────────────────────────────────────────────────

test("GET /api/profile returns member and linked player record", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/people?member_id=")) {
      return Response.json([{ slug: "john-jacobs", display_name: "John", handicap: 10, bio: "The Favorite" }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await getProfile({ request: accessRequest("https://example.com/api/profile"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.member.email, "john@example.com");
  assert.equal(body.player.slug, "john-jacobs");
  assert.equal(body.player.handicap, 10);
});

test("GET /api/profile falls back to display_name match when no member_id FK", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/people?member_id=")) {
      // Simulate column not existing → Supabase returns 400
      return new Response(JSON.stringify({ message: "column people.member_id does not exist" }), { status: 400 });
    }
    if (url.includes("/people?display_name=")) {
      return Response.json([{ slug: "john-jacobs", display_name: "John", handicap: 10 }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await getProfile({ request: accessRequest("https://example.com/api/profile"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.player?.slug, "john-jacobs");
});

test("GET /api/profile returns null player when no match found", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/people?")) return Response.json([]);
    return new Response("Not found", { status: 404 });
  };

  const response = await getProfile({ request: accessRequest("https://example.com/api/profile"), env });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.player, null);
});

// ── PATCH /api/profile ────────────────────────────────────────────────────────

test("PATCH /api/profile updates display_name on the member record", async () => {
  const memberPatchCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?id=eq.") && options?.method === "PATCH") {
      memberPatchCalls.push(JSON.parse(options.body));
      return new Response(null, { status: 204 });
    }
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await patchProfile({
    request: accessRequest("https://example.com/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ display_name: "John J." }),
    }),
    env,
  });

  assert.equal(response.status, 200);
  assert.equal(memberPatchCalls.length, 1);
  assert.equal(memberPatchCalls[0].display_name, "John J.");
});

test("PATCH /api/profile updates bio and handicap on the people record", async () => {
  const peoplePatchCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/people?member_id=")) {
      return Response.json([{ slug: "john-jacobs", display_name: "John", handicap: 10 }]);
    }
    if (url.includes("/people?slug=eq.") && options?.method === "PATCH") {
      peoplePatchCalls.push(JSON.parse(options.body));
      return Response.json([{ slug: "john-jacobs", display_name: "John", handicap: 9, bio: "Updated bio" }]);
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await patchProfile({
    request: accessRequest("https://example.com/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ bio: "Updated bio", handicap: 9 }),
    }),
    env,
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.player.handicap, 9);
  assert.equal(peoplePatchCalls[0].bio, "Updated bio");
  assert.equal(peoplePatchCalls[0].handicap, 9);
});

test("PATCH /api/profile rejects invalid handicap", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    return new Response("Not found", { status: 404 });
  };

  const response = await patchProfile({
    request: accessRequest("https://example.com/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ handicap: 99 }),
    }),
    env,
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(body.error.includes("handicap"));
});

test("PATCH /api/profile with no linked player still saves member fields", async () => {
  globalThis.fetch = async (url) => {
    if (url.includes("/members?")) {
      return Response.json([{ id: "member-1", email: "john@example.com", display_name: "John", avatar_url: null }]);
    }
    if (url.includes("/group_memberships?")) return Response.json([{ role: "member" }]);
    if (url.includes("/people?")) return Response.json([]);
    return new Response(null, { status: 204 });
  };

  const response = await patchProfile({
    request: accessRequest("https://example.com/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ display_name: "John J.", bio: "This won't save without a people record" }),
    }),
    env,
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.player, null);
});
