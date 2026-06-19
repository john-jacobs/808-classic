import { withApiErrors } from "../_lib/handler.js";
import { json } from "../_lib/http.js";
import { requireMember } from "../_lib/member.js";
import { createSignedStorageUrl, supabaseRequest } from "../_lib/supabase.js";

const personSelect = [
  "slug",
  "display_name",
  "title",
  "city",
  "height",
  "handicap",
  "odds",
  "classic_record",
  "bio",
  "quote",
  "strength",
  "weakness",
  "headshot_url",
  "action_photo_url",
  "person_type",
  "sort_order",
  "active",
].join(",");

function needsSignedUrl(path = "") {
  return path && !path.startsWith(".") && !path.startsWith("http") && !path.startsWith("data:");
}

async function displayImageUrl(env, path) {
  if (!needsSignedUrl(path)) return path || "";
  try {
    return await createSignedStorageUrl(env, "trip-media", path);
  } catch (error) {
    console.warn("Tournament image signing failed.", error);
    return path;
  }
}

export const onRequestGet = withApiErrors(async (context) => {
  await requireMember(context);

  const tripId = context.env.SUPABASE_TRIP_ID;
  const [tripRows, peopleRows, participantRows, sectionRows, lodgingRows, courseRows, eventRows] = await Promise.all([
    supabaseRequest(context.env, `/rest/v1/trips?id=eq.${tripId}&select=id,year,name,city,starts_on,ends_on,status,tagline,hero_image_url,settings&limit=1`),
    supabaseRequest(context.env, `/rest/v1/people?group_id=eq.${context.env.SUPABASE_GROUP_ID}&select=${personSelect}&order=sort_order`),
    supabaseRequest(context.env, `/rest/v1/tournament_participants?trip_id=eq.${tripId}&select=*,person:people(slug,display_name)&order=sort_order`),
    supabaseRequest(context.env, `/rest/v1/content_sections?trip_id=eq.${tripId}&select=section_key,title,body,visible,sort_order,config&order=sort_order`),
    supabaseRequest(context.env, `/rest/v1/lodging_options?trip_id=eq.${tripId}&select=*&order=sort_order`),
    supabaseRequest(context.env, `/rest/v1/tournament_courses?trip_id=eq.${tripId}&select=*,course:courses(*)&order=sort_order`),
    supabaseRequest(context.env, `/rest/v1/itinerary_events?trip_id=eq.${tripId}&select=*&order=sort_order`),
  ]);

  const trip = tripRows?.[0] || {};
  const people = await Promise.all(
    peopleRows.map(async (person) => ({
      id: person.slug,
      name: person.display_name,
      title: person.title,
      city: person.city,
      height: person.height,
      handicap: person.handicap,
      odds: person.odds,
      classic_record: person.classic_record,
      blurb: person.bio,
      quote: person.quote,
      strength: person.strength,
      weakness: person.weakness,
      headshot: await displayImageUrl(context.env, person.headshot_url),
      action_photo: await displayImageUrl(context.env, person.action_photo_url),
      person_type: person.person_type,
      sort_order: person.sort_order,
      active: person.active,
    })),
  );

  const classicAttendance = participantRows
    .filter((participant) => participant.participant_type !== "guest")
    .map((participant) => ({
      year: trip.year,
      person_id: participant.person.slug,
      status: participant.participant_type,
      rank: participant.rank,
      score: participant.leaderboard_score,
      arrival: participant.arrival,
      departure: participant.departure,
      odds: participant.odds,
      handicap: participant.handicap,
      classic_record: participant.classic_record,
      notes: participant.notes,
      sort_order: participant.sort_order,
      active: participant.active,
    }));

  return json({
    tournament: trip,
    people,
    classic_attendance: classicAttendance,
    site_copy: sectionRows.map((section) => ({
      key: section.section_key,
      title: section.title,
      body: section.body,
      active: section.visible,
      sort_order: section.sort_order,
      config: section.config,
    })),
    lodging: lodgingRows.map((lodging) => ({
      name: lodging.name,
      address: lodging.address,
      image: lodging.image_url,
      detail: lodging.detail,
      airbnb_url: lodging.booking_url,
      map_url: lodging.map_url,
      check_in: lodging.check_in,
      check_out: lodging.check_out,
      beds: lodging.beds,
      total: lodging.total,
      per_person: lodging.per_person,
      transit: lodging.transit,
      sort_order: lodging.sort_order,
      active: lodging.active,
    })),
    courses: courseRows.map((entry) => ({
      day: entry.day_label,
      name: entry.course.name,
      status: entry.booking_status,
      tee_times: entry.tee_time_notes,
      phone: entry.course.phone,
      address: entry.course.address,
      image: entry.course.image_url,
      blurb: entry.course.description,
      site_url: entry.course.website_url,
      map_url: entry.course.map_url,
      sort_order: entry.sort_order,
      active: entry.active,
    })),
    events: eventRows.map((event) => ({
      date: event.date_label,
      title: event.title,
      time: event.time_label,
      place: event.place,
      address: event.address,
      blurb: event.blurb,
      link: event.link_url,
      link_label: event.link_label,
      sort_order: event.sort_order,
      active: event.active,
    })),
    guests: participantRows
      .filter((participant) => participant.participant_type === "guest")
      .map((participant) => ({
        name: participant.person.display_name,
        role: participant.role_label,
        image: participant.image_url,
        image_fit: participant.image_fit,
        detail: participant.detail,
        sort_order: participant.sort_order,
        active: participant.active,
      })),
  });
});
