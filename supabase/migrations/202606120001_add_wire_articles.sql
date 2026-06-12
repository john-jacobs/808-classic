alter table public.posts
  add column headline text,
  add column dek text,
  add column byline text,
  add column location text,
  add column published_at timestamptz,
  add column metadata jsonb not null default '{}'::jsonb;

insert into public.posts (
  id, group_id, trip_id, author_id, type, headline, dek, byline, location,
  published_at, body, pinned, metadata
)
select
  '80800000-0000-4000-8002-000000000001',
  '80800000-0000-4000-8000-000000000001',
  '80800000-0000-4000-8000-000000002026',
  members.id,
  'dispatch',
  'Chuck Turns Back Arnaud at Macktown, 105-114',
  'A nervous challenger, a microscopic serving of birdie juice, and a back-nine charge settle the first match of the 2026 campaign.',
  '808 Wire Staff',
  'Rockton, Illinois',
  '2026-06-12T15:30:00-05:00',
  E'Macktown Golf Course once hosted an LPGA Tour event, welcoming winners including Betsy Rawls and Sandra Haynie between 1958 and 1965. On Friday, it provided a similarly historic stage for Charles Vokes and Arnaud Brisard to combine for 219 strokes.\n\nArnaud arrived nervous for reasons that remain unclear and addressed those nerves by drinking heavily. Chuck arrived sober and running his mouth. The opening stretch nevertheless belonged to Arnaud, who built a four-shot advantage before announcing that Chuck was considerably better. It was an unusually generous scouting report to deliver while leading.\n\nChuck steadied himself, turned a 55, and then produced the round''s decisive stretch on the back nine. His closing 50 beat Arnaud''s inward 56 and completed a nine-shot victory, 105 to 114. During the charge, Arnaud reported that Chuck was a monster on the back nine and documented a narrowly missed long birdie putt with the dispatch: “Chuck baggy just missed a long birdie put.”\n\nThe defending champion''s actual birdie activated the agreed-upon Fireball birdie-juice protocol. Chuck, who was not drinking, complied with a sip so small that its competitive and medicinal effects remain under review.\n\nArnaud spent portions of the round as a self-described head case. Chuck, serving as a golf coach despite ultimately signing for 105, talked him down. By the closing holes, the student had become the public-relations department: “Chuck played insane on the last couple holes. Chuck is a very good golfer.”\n\nChuck offered no reciprocal evaluation of Arnaud. Asked for comment, he first assessed himself: “I need to stop fucking around around the green. Irons weren''t great but I figured them out like I did at Lochmere with Jake.” Pressed to say something about his opponent, he declined to trash talk and submitted only: “It was beautiful weather on a nice course swinginf a club.”',
  true,
  jsonb_build_object(
    'kind', 'match_report',
    'course', 'Macktown Golf Course',
    'course_note', 'Host of an LPGA Tour event from 1958 through 1965.',
    'result', jsonb_build_object(
      'winner', 'Charles Vokes',
      'winner_total', 105,
      'runner_up', 'Arnaud Brisard',
      'runner_up_total', 114,
      'margin', 9
    ),
    'scorecard', jsonb_build_array(
      jsonb_build_object('name', 'Charles Vokes', 'front', 55, 'back', 50, 'total', 105, 'to_par', '+34'),
      jsonb_build_object('name', 'Arnaud Brisard', 'front', 58, 'back', 56, 'total', 114, 'to_par', '+43')
    ),
    'source_url', 'https://en.wikipedia.org/wiki/Cosmopolitan_Open'
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
    '80800000-0000-4000-8003-000000000001',
    '80800000-0000-4000-8002-000000000001',
    './assets/wire/arnaud-chuck-macktown.webp',
    'image/webp',
    1448,
    1086,
    0
  ),
  (
    '80800000-0000-4000-8003-000000000002',
    '80800000-0000-4000-8002-000000000001',
    './assets/wire/arnaud-chuck-scorecard.webp',
    'image/webp',
    1116,
    1385,
    1
  )
on conflict (id) do update set
  storage_path = excluded.storage_path,
  mime_type = excluded.mime_type,
  width = excluded.width,
  height = excluded.height,
  sort_order = excluded.sort_order;
