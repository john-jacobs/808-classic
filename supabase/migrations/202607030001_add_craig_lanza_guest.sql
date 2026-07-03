with upsert_person as (
  insert into public.people (
    group_id, slug, display_name, headshot_url, person_type, sort_order, active
  )
  values (
    '80800000-0000-4000-8000-000000000001',
    'craig-lanza',
    'Craig Lanza',
    './assets/optimized/people/guests/craig-lanza-scotland-900.webp',
    'guest',
    4,
    true
  )
  on conflict (group_id, slug) do update set
    display_name = excluded.display_name,
    headshot_url = excluded.headshot_url,
    person_type = excluded.person_type,
    sort_order = excluded.sort_order,
    active = excluded.active,
    updated_at = now()
  returning id
)
insert into public.tournament_participants (
  trip_id, person_id, participant_type, attendance_status, role_label, detail,
  image_url, image_fit, sort_order, active
)
select
  '80800000-0000-4000-8000-000000002026',
  id,
  'guest',
  'parallel_universe',
  'Parallel Universe Guest',
  'Craig is married to Devon, who went to college with Julia, and is running a parallel Seattle golf trip the same weekend. His crew is doing Gold Mountain and the Mariners too, just on opposite days, then adding Chambers Bay for good measure. They are also bringing wives and spa programming, which is suspiciously competent. We probably will not see him, but somewhere nearby Craig is mogging us from the prestige-course alternate timeline.',
  './assets/optimized/people/guests/craig-lanza-scotland-900.webp',
  null,
  104,
  true
from upsert_person
on conflict (trip_id, person_id) do update set
  participant_type = excluded.participant_type,
  attendance_status = excluded.attendance_status,
  role_label = excluded.role_label,
  detail = excluded.detail,
  image_url = excluded.image_url,
  image_fit = excluded.image_fit,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();
