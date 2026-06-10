create table public.tournament_series (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, slug)
);

alter table public.trips
  add column series_id uuid references public.tournament_series(id) on delete restrict,
  add column year integer,
  add column tagline text,
  add column hero_image_url text,
  add column settings jsonb not null default '{}'::jsonb;

create table public.people (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  slug text not null,
  display_name text not null,
  title text,
  city text,
  height text,
  bio text,
  quote text,
  strength text,
  weakness text,
  headshot_url text,
  action_photo_url text,
  person_type text not null default 'member',
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, slug)
);

create table public.member_people (
  member_id uuid primary key references public.members(id) on delete cascade,
  person_id uuid not null unique references public.people(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.tournament_participants (
  trip_id uuid not null references public.trips(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  participant_type text not null default 'player',
  attendance_status text not null default 'confirmed',
  rank integer,
  leaderboard_score text,
  arrival text,
  departure text,
  odds text,
  handicap numeric(5,1),
  classic_record text,
  notes text,
  role_label text,
  detail text,
  image_url text,
  image_fit text,
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (trip_id, person_id)
);

create table public.content_sections (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  section_key text not null,
  section_type text not null default 'rich_text',
  title text,
  body text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, section_key)
);

create table public.lodging_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  address text,
  image_url text,
  detail text,
  booking_url text,
  map_url text,
  check_in text,
  check_out text,
  beds text,
  total text,
  per_person text,
  transit text,
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  phone text,
  address text,
  image_url text,
  description text,
  website_url text,
  map_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournament_courses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  day_label text,
  booking_status text,
  tee_time_notes text,
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, course_id)
);

alter table public.rounds
  add column tournament_course_id uuid references public.tournament_courses(id) on delete set null;

create table public.itinerary_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date_label text,
  title text not null,
  time_label text,
  place text,
  address text,
  blurb text,
  link_url text,
  link_label text,
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tournament_series_group_idx on public.tournament_series (group_id);
create index people_group_sort_idx on public.people (group_id, sort_order);
create index tournament_participants_trip_sort_idx on public.tournament_participants (trip_id, sort_order);
create index content_sections_trip_sort_idx on public.content_sections (trip_id, sort_order);
create index lodging_options_trip_sort_idx on public.lodging_options (trip_id, sort_order);
create index tournament_courses_trip_sort_idx on public.tournament_courses (trip_id, sort_order);
create index itinerary_events_trip_sort_idx on public.itinerary_events (trip_id, sort_order);
create index rounds_tournament_course_idx on public.rounds (tournament_course_id);

alter table public.tournament_series enable row level security;
alter table public.people enable row level security;
alter table public.member_people enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.content_sections enable row level security;
alter table public.lodging_options enable row level security;
alter table public.courses enable row level security;
alter table public.tournament_courses enable row level security;
alter table public.itinerary_events enable row level security;

revoke all on table
  public.tournament_series,
  public.people,
  public.member_people,
  public.tournament_participants,
  public.content_sections,
  public.lodging_options,
  public.courses,
  public.tournament_courses,
  public.itinerary_events
from anon, authenticated;

grant select, insert, update, delete on table
  public.tournament_series,
  public.people,
  public.member_people,
  public.tournament_participants,
  public.content_sections,
  public.lodging_options,
  public.courses,
  public.tournament_courses,
  public.itinerary_events
to service_role;

insert into public.tournament_series (id, group_id, slug, name, description)
values (
  '80800000-0000-4000-8000-000000000808',
  '80800000-0000-4000-8000-000000000001',
  '808-classic',
  '808 Classic',
  'The annual reconvening of the 808 Cali Boys.'
)
on conflict (group_id, slug) do update
set name = excluded.name, description = excluded.description, updated_at = now();

update public.trips
set
  series_id = '80800000-0000-4000-8000-000000000808',
  year = 2026,
  tagline = 'A tradition like many others.',
  hero_image_url = './assets/optimized/hero-1400.webp'
where id = '80800000-0000-4000-8000-000000002026';

insert into public.people (
  group_id, slug, display_name, title, city, height, bio, quote, strength, weakness,
  headshot_url, action_photo_url, person_type, sort_order, active
)
values
  ('80800000-0000-4000-8000-000000000001','liam-hession','Liam Hession','The Papist','Chicago, IL','5'' 8"','The unofficial Seattle representative for the week, more invested in everyone properly appreciating the city than in the golf itself. He is staying beyond the Classic and, if we are being honest, may be personally more excited to see Kevin Crews and Japanese Guy than the 808 Cali Boys.','"I am mostly here for Kevin Crews."','Catholicism','Data Centers','./assets/optimized/people/headshots/liam-headshot.webp','./assets/people/stylized/action/liam-action.jpg','current_player',1,true),
  ('80800000-0000-4000-8000-000000000001','john-jacobs','John Jacobs','The Baptist','Oakland, CA','6'' 1"','The odds-on favorite only because Bill is not making the trip. Plays the most, cares too much about etiquette, and has already spent enough time on this website to make everyone uncomfortable.','"Actually, I think the rule is..."','Mulligans','Consensus','./assets/optimized/people/headshots/john-headshot.webp','./assets/people/stylized/action/john-action.jpg','current_player',2,true),
  ('80800000-0000-4000-8000-000000000001','charles-vokes','Charles Vokes','The Defending Champion','Willowbrook, IL','6'' 1"','The reigning Orange Jacket holder and inaugural Chicago champion. His victory remains legally valid despite a scoring environment best described as ceremonial.','"Kyle says..."','Kyle''s guidance','Grammar','./assets/optimized/people/headshots/chuck-headshot.webp','./assets/people/stylized/action/chuck-action.jpg','current_player',3,true),
  ('80800000-0000-4000-8000-000000000001','jake-dam','Jake Dam','The Natural','Raleigh, NC','6'' 4"','Known formally as The Natural, with the quiet confidence of someone who believes every swing issue left over from baseball can be solved by strengthening his grip.','"I just need to strengthen my grip."','Falcon punch','John Hamm','./assets/optimized/people/headshots/jakedam-headshot.webp','./assets/people/stylized/action/jakedam-action.jpg','current_player',4,true),
  ('80800000-0000-4000-8000-000000000001','arjun-nayini','Arjun Nayini','The Cinefile','San Francisco, CA','6'' 0"','A central IMSA bloc member with limited golf exposure and a Saturday conflict of unusually high cultural legitimacy: The Odyssey, booked a year in advance by Kjellen','"I may have a prior commitment."','Muay Thai','Kit Feber','./assets/optimized/people/headshots/arjun-headshot.webp','./assets/people/stylized/action/arjun-action.jpg','current_player',5,true),
  ('80800000-0000-4000-8000-000000000001','evan-rodrigues','Evan Rodrigues','The Father','San Francisco, CA','5'' 8"','Arrives with flight numbers, competitive intent, and a long memory of being told in college that a natural swing cannot be reverse-engineered in adulthood.','"That swing comment has stayed with me."','Dad strength','Athleticism','./assets/optimized/people/headshots/evan-headshot.webp','./assets/people/stylized/action/evan-action.jpg','current_player',6,true),
  ('80800000-0000-4000-8000-000000000001','david-weizeorick','David Weizeorick','The Flight Risk','Austin, TX','5'' 8"','The field''s leading candidate to experience a travel-related incident. Has missed flights, nearly missed flights, and discussed missing flights enough that the distinction no longer matters. Chuck in the bed.','"What time is the flight?"','Risk Management','Risk Management','./assets/optimized/people/headshots/david-headshot.webp','./assets/people/stylized/action/david-action.jpg','current_player',7,true),
  ('80800000-0000-4000-8000-000000000001','bill-buchdal','Bill Buchdal','The Sill','Chicago, IL','5'' 8"','A key absence from the Seattle field and the main reason John''s favorite status requires an asterisk.','"I''ll never see this"',null,null,null,null,'past_player',20,true),
  ('80800000-0000-4000-8000-000000000001','aaron-daroch','Aaron Darroch','The Baron','Chicago, IL','6'' 2"','A new father with no time to make for a bunch of BNs','"Let the data flow"',null,null,null,null,'past_player',21,true),
  ('80800000-0000-4000-8000-000000000001','hadrien-brisard','Hadrien Brisard','The Wildcard','Rockford, IL','5'' 4"','Robot and sons','"I support local STEM initiatives"',null,null,null,null,'past_player',22,true),
  ('80800000-0000-4000-8000-000000000001','arnaud-brisard','Arnaud Brisard','The Little Brother','Rockton, IL','5'' 3"','Little doctor','"I hate section 8 housing"',null,null,null,null,'past_player',23,true),
  ('80800000-0000-4000-8000-000000000001','kevin-crews','Kevin Crews',null,null,null,null,null,null,null,'./assets/optimized/people/headshots/kevincrews-headshot.webp',null,'guest',1,true),
  ('80800000-0000-4000-8000-000000000001','japanese-guy','Japanese Guy',null,null,null,null,null,null,null,'./assets/optimized/people/guests/japanese-man-620.webp',null,'guest',2,true),
  ('80800000-0000-4000-8000-000000000001','josh-kyla-elora-elodie','Josh, Kyla, Elora, and Elodie',null,null,null,null,null,null,null,'./assets/optimized/people/guests/elora-josh-kyla-900.webp',null,'family',3,true)
on conflict (group_id, slug) do update set
  display_name=excluded.display_name, title=excluded.title, city=excluded.city, height=excluded.height,
  bio=excluded.bio, quote=excluded.quote, strength=excluded.strength, weakness=excluded.weakness,
  headshot_url=excluded.headshot_url, action_photo_url=excluded.action_photo_url,
  person_type=excluded.person_type, sort_order=excluded.sort_order, active=excluded.active, updated_at=now();

insert into public.member_people (member_id, person_id)
select m.id, p.id
from public.members m
join public.people p on p.group_id='80800000-0000-4000-8000-000000000001'
and (
  (m.display_name='John Jacobs' and p.slug='john-jacobs') or
  (m.display_name='Liam Hession' and p.slug='liam-hession') or
  (m.display_name='Charles Vokes' and p.slug='charles-vokes') or
  (m.display_name='Jake Dam' and p.slug='jake-dam') or
  (m.display_name='Arjun Nayini' and p.slug='arjun-nayini') or
  (m.display_name='Evan Rodrigues' and p.slug='evan-rodrigues') or
  (m.display_name='David Weizeorick' and p.slug='david-weizeorick') or
  (m.display_name='Bill Buchdal' and p.slug='bill-buchdal') or
  (m.display_name='Aaron Darroch' and p.slug='aaron-daroch') or
  (m.display_name='Hadrien Brisard' and p.slug='hadrien-brisard') or
  (m.display_name='Arnaud Brisard' and p.slug='arnaud-brisard')
)
on conflict (member_id) do update set person_id=excluded.person_id;

insert into public.tournament_participants (
  trip_id, person_id, participant_type, attendance_status, rank, leaderboard_score,
  arrival, departure, odds, handicap, classic_record, notes, role_label, detail,
  image_url, image_fit, sort_order, active
)
select '80800000-0000-4000-8000-000000002026', p.id, v.participant_type, v.attendance_status,
  v.rank, v.leaderboard_score, v.arrival, v.departure, v.odds, v.handicap, v.classic_record,
  v.notes, v.role_label, v.detail, v.image_url, v.image_fit, v.sort_order, true
from (values
  ('liam-hession','player','confirmed',1,'E','Thu 7/16, sometime','Staying into the next week','+2500',36.0,'1 appearance',null,null,null,null,null,1),
  ('john-jacobs','player','confirmed',2,'E','Thu 7/16, 8:26 AM - AS 491','Sun 7/19, 8:47 PM','+225',10.0,'1 appearance',null,null,null,null,null,2),
  ('charles-vokes','player','confirmed',3,'E','Thu 7/16, noon','Sun 7/19, 10:52 AM','+500',18.0,'2025 champion','Defending champion',null,null,null,null,3),
  ('jake-dam','player','confirmed',4,'E','Thu 7/16, noonish','Sun 7/19, like 9:30','+700',22.0,'1 appearance',null,null,null,null,null,4),
  ('arjun-nayini','player','confirmed',5,'E','TBD','TBD','+4000',40.0,'1 appearance',null,null,null,null,null,5),
  ('evan-rodrigues','player','confirmed',6,'E','Thu 7/16, 2:30 PM - UA2744','Sun 7/19, 10:29 AM - UA1482','+650',20.0,'1 appearance',null,null,null,null,null,6),
  ('david-weizeorick','player','confirmed',7,'E','Thu 7/16, likely noon','Sun 7/19, TBD','+1800',24.0,'1 appearance',null,null,null,null,null,7),
  ('bill-buchdal','past_player','not_attending',null,null,null,null,null,6.0,'2025 field','Not in the 2026 field',null,null,null,null,20),
  ('kevin-crews','guest','invited',null,null,null,null,null,null,null,null,'Mariners Game Guest','High school with Liam, Evan, and Arjun at IMSA; elementary and middle school with John. A rare multi-era credentialed attendee.','./assets/optimized/people/headshots/kevincrews-headshot.webp',null,101),
  ('japanese-guy','guest','possible',null,null,null,null,null,null,null,null,'Potential Seattle Guest','Liam met a guy in Japan who will also be visiting Seattle at the same time. This is exactly the kind of note an official tournament site should preserve forever.','./assets/optimized/people/guests/japanese-man-620.webp','contain',102),
  ('josh-kyla-elora-elodie','guest','invited',null,null,null,null,null,null,null,null,'Family Contingent','John''s brother-in-law Josh and family. Elora is four and Elodie was just welcomed to this world on June 3rd, 2026. John should say hello.','./assets/optimized/people/guests/elora-josh-kyla-900.webp',null,103)
) as v(slug,participant_type,attendance_status,rank,leaderboard_score,arrival,departure,odds,handicap,classic_record,notes,role_label,detail,image_url,image_fit,sort_order)
join public.people p on p.group_id='80800000-0000-4000-8000-000000000001' and p.slug=v.slug
on conflict (trip_id, person_id) do update set
  participant_type=excluded.participant_type, attendance_status=excluded.attendance_status,
  rank=excluded.rank, leaderboard_score=excluded.leaderboard_score, arrival=excluded.arrival,
  departure=excluded.departure, odds=excluded.odds, handicap=excluded.handicap,
  classic_record=excluded.classic_record, notes=excluded.notes, role_label=excluded.role_label,
  detail=excluded.detail, image_url=excluded.image_url, image_fit=excluded.image_fit,
  sort_order=excluded.sort_order, active=excluded.active, updated_at=now();

insert into public.content_sections (trip_id, section_key, section_type, title, body, sort_order, visible)
values
  ('80800000-0000-4000-8000-000000002026','about','rich_text',null,E'The 808 Classic is the annual reconvening of the 808 Cali Boys: a cross-country effort to get everyone back in the same place, play some golf, and keep the old house alive in a slightly more official form.\n\nThe name traces back to 808 California Ave in Urbana, where the group lived senior year before graduating in 2013. Year two brings the Orange Jacket to Seattle, with Illinois roots, scattered home bases, and just enough ceremony to make a normal golf trip feel questionably official.',10,true),
  ('80800000-0000-4000-8000-000000002026','history','rich_text','History',E'The inaugural 808 Classic was held in the Chicagoland area in 2025, with Chuck hosting the field and ultimately taking possession of the first Orange Jacket. The victory remains official, despite the fact that several core tournament institutions, including rules, handicaps, recordkeeping, and basic competitive integrity, were still under active development.\n\nThe 2025 routing included Zigfield Troy, Big Run, The Preserve, a large-field scramble at Ruffled Feathers, and a Sunday round at Belmont in Downers Grove. It was less a tightly managed championship than a proof of concept: enough golf, enough logistics, and enough ceremony to establish that this probably needed to happen again.\n\nYear two brings the Classic to Seattle. The field is smaller, the website is more elaborate, and the tournament now has just enough history to pretend it has traditions. Several notable figures from the broader 808 ecosystem will not be making the trip, including Hadrien and Arnaud Brisard, Bill Buchdal, Aaron Darroch, Nick Greenway, and one participant whose connection to the house remains a matter of ongoing historical debate.\n',90,true)
on conflict (trip_id, section_key) do update set title=excluded.title, body=excluded.body, sort_order=excluded.sort_order, visible=excluded.visible, updated_at=now();

insert into public.lodging_options (trip_id,name,address,image_url,detail,booking_url,map_url,check_in,check_out,beds,total,per_person,transit,sort_order,active)
values ('80800000-0000-4000-8000-000000002026','Ravenna Tournament House','1206 Northeast 68th Street, Seattle, WA 98115','./assets/optimized/airbnb-ravenna-900.webp','Gorgeous 4bd/3ba house with AC, a BBQ grill, and a one-block walk to Roosevelt Light Rail. Official headquarters for sleep math, jacket security, and pretending this trip has a board of directors.','https://www.airbnb.com/rooms/886590523948778465','https://www.google.com/maps/search/?api=1&query=1206+Northeast+68th+Street%2C+Seattle%2C+WA+98115','Thu Jul 16, 4:00 PM','Sun Jul 19, 10:00 AM','3 kings, 2 bunks, 2 couches','$3,385 for 3 nights','$483.57 each at 7 guys','3-minute walk to light rail',1,true);

insert into public.courses (slug,name,phone,address,image_url,description,website_url,map_url)
values
  ('interbay-golf-center','Interbay Golf Center','206-285-2200','2501 15th Avenue West, Seattle, WA 98119','./assets/optimized/courses/interbay-900.jpg','A practical 9 hole, par 3 course and Top Tracer enabled driving range is a great way for the 808 Cali Bros to warm up after a long day of travel','https://premiergc.com/-interbay-golf-center','https://www.google.com/maps/search/?api=1&query=2501%2015th%20Avenue%20West%2C%20Seattle%2C%20WA%2098119'),
  ('jackson-park-golf-course','Jackson Park Golf Course','206-363-4747','1000 NE 135th Street, Seattle, WA 98125','./assets/optimized/courses/jackson-park-900.jpg','A classic Seattle municipal round with tree-lined fairways, enough room for a proper Friday match, and the considerable logistical advantage of staying in the city before the Mariners game.','https://www.premiergc.com/-jackson-park-golf-course','https://www.google.com/maps/search/?api=1&query=1000%20NE%20135th%20Street%2C%20Seattle%2C%20WA%2098125'),
  ('gold-mountain-golf-club','Gold Mountain Golf Club','360-415-5432','7263 W Belfair Valley Rd, Bremerton, WA 98312','./assets/optimized/courses/gold-mountain-olympic-1100.webp','The Olympic course is the ferry-day main event: a forested, tournament-tested championship round reached through a fully sanctioned Puget Sound logistical subplot.','https://goldmountaingolf.com/','https://www.google.com/maps/search/?api=1&query=7263%20W%20Belfair%20Valley%20Rd%2C%20Bremerton%2C%20WA%2098312')
on conflict (slug) do update set name=excluded.name, phone=excluded.phone, address=excluded.address, image_url=excluded.image_url, description=excluded.description, website_url=excluded.website_url, map_url=excluded.map_url, updated_at=now();

insert into public.tournament_courses (trip_id,course_id,day_label,booking_status,tee_time_notes,sort_order,active)
select '80800000-0000-4000-8000-000000002026', c.id, v.day_label, v.booking_status, v.tee_time_notes, v.sort_order, true
from (values
  ('interbay-golf-center','Thursday','Unbooked','Must book July 1st',1),
  ('jackson-park-golf-course','Friday','Unbooked','Booking opens Thu Jul 2 at 9:00 PM (15 days ahead)',2),
  ('gold-mountain-golf-club','Saturday','Unbooked','TBD - coordinate with ferry schedule',3)
) v(slug,day_label,booking_status,tee_time_notes,sort_order)
join public.courses c on c.slug=v.slug
on conflict (trip_id,course_id) do update set day_label=excluded.day_label, booking_status=excluded.booking_status, tee_time_notes=excluded.tee_time_notes, sort_order=excluded.sort_order, active=excluded.active, updated_at=now();

update public.rounds r
set tournament_course_id=tc.id,
    holes=case when r.course_name='Interbay Golf Center' then 9 else r.holes end
from public.tournament_courses tc
join public.courses c on c.id=tc.course_id
where r.trip_id=tc.trip_id and r.course_name=c.name;

insert into public.itinerary_events (trip_id,date_label,title,time_label,place,address,blurb,link_url,link_label,sort_order,active)
values
  ('80800000-0000-4000-8000-000000002026','Thu Jul 16','Various Arrivals','9:00 AM - 2:30 PM','SEATAC',null,'Flights land in waves and folks should all be on Seattle soil by 2:30, maybe later pending David antics...',null,null,1,true),
  ('80800000-0000-4000-8000-000000002026','Thu Jul 16','Golf at Interbay Golf Center','Tee time TBD','Interbay Golf Center','2501 15th Avenue West, Seattle, WA 98119','Arrival-day warmup on Interbay''s nine-hole par-3 course, with the Toptracer range available for anyone who needs immediate evidence that the flight was not the problem.','https://www.premiergc.com/-interbay-golf-center','Course website',2,true),
  ('80800000-0000-4000-8000-000000002026','Thu Jul 16','Ravenna Check-In','4:00 PM check-in','1206 Northeast 68th Street','1206 Northeast 68th Street, Seattle, WA 98115','The house opens but we should be golfing...','https://www.google.com/maps/search/?api=1&query=1206%20Northeast%2068th%20Street%2C%20Seattle%2C%20WA%2098115','Open house map',3,true),
  ('80800000-0000-4000-8000-000000002026','Thu Jul 16','Dinner','TBFD','TBD',null,'Get food',null,null,4,true),
  ('80800000-0000-4000-8000-000000002026','Fri Jul 17','Golf at Jackson Park Golf Course','Tee time TBD','Jackson Park Golf Course','1000 NE 135th Street, Seattle, WA 98125','Friday''s in-city round before the Mariners game. Booking opens Thursday, July 2 at 9:00 PM, exactly 15 days ahead.','https://www.premiergc.com/-jackson-park-golf-course','Course website',5,true),
  ('80800000-0000-4000-8000-000000002026','Fri Jul 17','Mariners vs. Giants','7:10 PM first pitch','T-Mobile Park, Section 192',null,'Officially an evening cultural program. Kevin Crews joins the crew.','https://www.mlb.com/mariners/schedule/2026/fullseason','Mariners schedule',6,true),
  ('80800000-0000-4000-8000-000000002026','Sat Jul 18','Bainbridge Ferry','Departure TBD - coordinate with tee time','Seattle Ferry Terminal','801 Alaskan Way, Seattle, WA 98104','The Gold Mountain round begins with the full Seattle-to-Bainbridge ferry experience before the drive to Bremerton. Scenic transit is now an official competitive obligation.','https://wsdot.com/ferries/schedule/scheduledetailbyroute.aspx?route=sea-bi','Ferry schedule',8,true),
  ('80800000-0000-4000-8000-000000002026','Sat Jul 18','Golf at Gold Mountain Golf Club','Tee time TBD','Gold Mountain Golf Club','7263 W Belfair Valley Rd, Bremerton, WA 98312','The championship round on the Olympic course. Ferry timing, drive time, and the tee sheet must be treated as one interconnected operation.','https://goldmountaingolf.com/','Course website',9,true),
  ('80800000-0000-4000-8000-000000002026','Sat Jul 18','Champions Dinner','After golf','Seattle, venue TBD',null,'Formal-ish meal where the champion will be treated with respect and give a rousing speech.',null,null,10,true),
  ('80800000-0000-4000-8000-000000002026','Sun Jul 19','Checkout & Departures','10:00 AM checkout','Ravenna command center',null,'Final accounting, luggage extraction, airport dispersal, and the quiet dignity of pretending no one is sore.',null,null,11,true);
