insert into public.posts (
  id, group_id, trip_id, author_id, type, headline, dek, byline, location,
  published_at, body, pinned, metadata
)
select
  '80800000-0000-4000-8002-000000000002',
  '80800000-0000-4000-8000-000000000001',
  '80800000-0000-4000-8000-000000002026',
  members.id,
  'dispatch',
  'Chuck Opens Big Run Mentorship Program, Escapes 117-119',
  'At his home course, the defending champion guided a younger math-department colleague through Big Run and survived despite 46 putts, five penalties, and another formal statement about the greens.',
  '808 Wire Staff',
  'Lockport, Illinois',
  '2026-06-15T21:24:00-05:00',
  E'Big Run Golf Club has officially become the defending champion''s teaching hospital. On Monday, Charles Vokes returned to his home course with Benjamin, a younger teacher from the math department, for what can only be described as a mentorship round conducted under live-fire conditions.\n\nChuck won, technically. His 117 edged Benjamin''s 119 by two shots, which is both a result and an indictment of the scoring environment. The card shows Chuck turning in 59 and coming home in 58, a level of steadiness that only looks comforting until you notice the ten on the ninth, the nine on the eighteenth, and the fact that the whole thing still required 117 strokes.\n\nThe round produced useful data. Chuck hit half his fairways, found two greens in regulation, took 46 putts, recorded ten three-putts, and assessed the matter with unusual clarity: "My irons are so fucked right now. Definitely still have to stop fucking around around the greens."\n\nFor Benjamin, the apprenticeship was immediate and immersive. He opened with a 57, closed with a 62, and still forced Chuck to produce something resembling veteran composure. It was less Big Brother, Big Run than Big Brother, Big Number.\n\nThe 808 Classic will classify the result as a successful defense of departmental seniority and an ongoing concern for the short game.',
  false,
  jsonb_build_object(
    'kind', 'match_report',
    'course', 'Big Run Golf Club',
    'course_note', 'A 1930 Lockport par 72 that can stretch past 7,000 yards, with elevation changes, no driving range, and enough putting trouble to make 46 putts feel narratively inevitable.',
    'result', jsonb_build_object(
      'winner', 'Charles Vokes',
      'winner_total', 117,
      'runner_up', 'Benjamin',
      'runner_up_total', 119,
      'margin', 2
    ),
    'scorecard', jsonb_build_array(
      jsonb_build_object('name', 'Charles Vokes', 'front', 59, 'back', 58, 'total', 117, 'to_par', '+45'),
      jsonb_build_object('name', 'Benjamin', 'front', 57, 'back', 62, 'total', 119, 'to_par', '+47')
    ),
    'stats', jsonb_build_object(
      'fairways_hit', '50% (7)',
      'greens_in_regulation', '11.1% (2)',
      'total_putts', 46,
      'putts_per_hole', 2.6,
      'three_putts', 10,
      'sand_saves', '0%',
      'up_and_down', '0%',
      'penalties', 5
    ),
    'media_captions', jsonb_build_object(
      './assets/wire/chuck-big-run-scorecard.webp', 'Final card · Chuck 117, Benjamin 119',
      './assets/wire/chuck-big-run-stats-composite.webp', '18Birdies stats · Gross score, fairways, putting, and penalties'
    ),
    'source_url', 'https://www.bigrungolf.com/course-layout/'
  )
from public.members
where email = 'john.robert.jacobs@gmail.com'
on conflict (id) do update set
  headline = excluded.headline,
  dek = excluded.dek,
  byline = excluded.byline,
  location = excluded.location,
  published_at = excluded.published_at,
  body = excluded.body,
  pinned = excluded.pinned,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.post_media (
  id, post_id, storage_path, mime_type, width, height, sort_order
)
values
  (
    '80800000-0000-4000-8003-000000000006',
    '80800000-0000-4000-8002-000000000002',
    './assets/wire/big-run-course-hero.webp',
    'image/webp',
    1024,
    683,
    0
  ),
  (
    '80800000-0000-4000-8003-000000000003',
    '80800000-0000-4000-8002-000000000002',
    './assets/wire/chuck-big-run-scorecard.webp',
    'image/webp',
    970,
    1026,
    1
  ),
  (
    '80800000-0000-4000-8003-000000000004',
    '80800000-0000-4000-8002-000000000002',
    './assets/wire/chuck-big-run-stats-composite.webp',
    'image/webp',
    1206,
    4066,
    2
  )
on conflict (id) do update set
  storage_path = excluded.storage_path,
  mime_type = excluded.mime_type,
  width = excluded.width,
  height = excluded.height,
  sort_order = excluded.sort_order;

delete from public.post_media
where id = '80800000-0000-4000-8003-000000000005';
