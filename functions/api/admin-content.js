import { withApiErrors } from "../_lib/handler.js";
import { apiError, json, readJson } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { supabaseRequest } from "../_lib/supabase.js";

function cleanString(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function cleanBool(value) {
  return value === true || value === "true" || value === "on" || value === 1;
}

function cleanNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function slugify(value) {
  const slug = cleanString(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `course-${crypto.randomUUID().slice(0, 8)}`;
}

function requireAdmin(member) {
  if (!["owner", "admin"].includes(member.role)) {
    throw Object.assign(new Error("Only admins can edit trip content"), { status: 403 });
  }
}

async function loadAdminContent(env) {
  const [courseRows, eventRows] = await Promise.all([
    supabaseRequest(env, `/rest/v1/tournament_courses?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=*,course:courses(*)&order=sort_order`),
    supabaseRequest(env, `/rest/v1/itinerary_events?trip_id=eq.${env.SUPABASE_TRIP_ID}&select=*&order=sort_order`),
  ]);

  return {
    courses: courseRows.map((entry) => ({
      id: entry.id,
      course_id: entry.course_id,
      day_label: entry.day_label,
      booking_status: entry.booking_status,
      tee_time_notes: entry.tee_time_notes,
      sort_order: entry.sort_order,
      active: entry.active,
      name: entry.course?.name || "",
      phone: entry.course?.phone || "",
      address: entry.course?.address || "",
      image_url: entry.course?.image_url || "",
      description: entry.course?.description || "",
      website_url: entry.course?.website_url || "",
      map_url: entry.course?.map_url || "",
    })),
    events: eventRows.map((event) => ({
      id: event.id,
      date_label: event.date_label,
      title: event.title,
      time_label: event.time_label,
      place: event.place,
      address: event.address,
      blurb: event.blurb,
      link_url: event.link_url,
      link_label: event.link_label,
      sort_order: event.sort_order,
      active: event.active,
    })),
  };
}

async function upsertCourse(env, input, index) {
  const courseId = cleanString(input.course_id, 80);
  const name = cleanString(input.name, 160);
  if (!name) return null;

  let course;
  const courseBody = {
    name,
    phone: cleanString(input.phone, 80),
    address: cleanString(input.address, 240),
    image_url: cleanString(input.image_url, 500),
    description: cleanString(input.description, 1200),
    website_url: cleanString(input.website_url, 500),
    map_url: cleanString(input.map_url, 500),
    updated_at: new Date().toISOString(),
  };

  if (courseId) {
    const rows = await supabaseRequest(env, `/rest/v1/courses?id=eq.${courseId}&select=*`, {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: courseBody,
    });
    course = rows?.[0];
  } else {
    const rows = await supabaseRequest(env, "/rest/v1/courses?on_conflict=slug&select=*", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: { ...courseBody, slug: slugify(name) },
    });
    course = rows?.[0];
  }

  if (!course?.id) return null;

  const tournamentCourseBody = {
    trip_id: env.SUPABASE_TRIP_ID,
    course_id: course.id,
    day_label: cleanString(input.day_label, 80) || name,
    booking_status: cleanString(input.booking_status, 120),
    tee_time_notes: cleanString(input.tee_time_notes, 240),
    sort_order: cleanNumber(input.sort_order, index + 1),
    active: cleanBool(input.active),
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    await supabaseRequest(env, `/rest/v1/tournament_courses?id=eq.${cleanString(input.id, 80)}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: tournamentCourseBody,
    });
    return course.id;
  }

  await supabaseRequest(env, "/rest/v1/tournament_courses?on_conflict=trip_id,course_id", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: tournamentCourseBody,
  });
  return course.id;
}

async function upsertEvent(env, input, index) {
  const title = cleanString(input.title, 180);
  if (!title) return null;

  const body = {
    trip_id: env.SUPABASE_TRIP_ID,
    date_label: cleanString(input.date_label, 80),
    title,
    time_label: cleanString(input.time_label, 120),
    place: cleanString(input.place, 180),
    address: cleanString(input.address, 240),
    blurb: cleanString(input.blurb, 1200),
    link_url: cleanString(input.link_url, 500),
    link_label: cleanString(input.link_label, 120),
    sort_order: cleanNumber(input.sort_order, index + 1),
    active: cleanBool(input.active),
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    await supabaseRequest(env, `/rest/v1/itinerary_events?id=eq.${cleanString(input.id, 80)}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body,
    });
    return input.id;
  }

  await supabaseRequest(env, "/rest/v1/itinerary_events", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body,
  });
  return null;
}

export const onRequestGet = withApiErrors(async (context) => {
  const member = await requireMember(context);
  requireAdmin(member);
  return json(await loadAdminContent(context.env));
});

export const onRequestPatch = withApiErrors(async (context) => {
  const member = await requireMember(context);
  requireAdmin(member);
  const input = await readJson(context.request);
  const courses = Array.isArray(input.courses) ? input.courses : [];
  const events = Array.isArray(input.events) ? input.events : [];

  await Promise.all([
    ...courses.map((course, index) => upsertCourse(context.env, course, index)),
    ...events.map((event, index) => upsertEvent(context.env, event, index)),
  ]);

  return json(await loadAdminContent(context.env));
});
