insert into public.trips (
  group_id, series_id, slug, name, city, year, status, tagline
)
values (
  '80800000-0000-4000-8000-000000000001',
  '80800000-0000-4000-8000-000000000808',
  '2025-chicago',
  '808 Classic 2025',
  'Chicagoland',
  2025,
  'complete',
  'The inaugural 808 Classic'
)
on conflict (group_id, slug) do update set
  series_id = excluded.series_id,
  name = excluded.name,
  city = excluded.city,
  year = excluded.year,
  status = excluded.status,
  tagline = excluded.tagline,
  updated_at = now();

insert into public.tournament_participants (
  trip_id, person_id, participant_type, attendance_status, handicap,
  classic_record, notes, sort_order, active
)
select
  trip.id,
  person.id,
  'player',
  'confirmed',
  6.0,
  '2025 field',
  'Not in the 2026 field',
  20,
  true
from public.trips trip
join public.people person
  on person.group_id = trip.group_id
 and person.slug = 'bill-buchdal'
where trip.group_id = '80800000-0000-4000-8000-000000000001'
  and trip.slug = '2025-chicago'
on conflict (trip_id, person_id) do update set
  participant_type = excluded.participant_type,
  attendance_status = excluded.attendance_status,
  handicap = excluded.handicap,
  classic_record = excluded.classic_record,
  notes = excluded.notes,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();
