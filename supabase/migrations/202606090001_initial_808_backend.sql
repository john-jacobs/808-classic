create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.group_role as enum ('owner', 'admin', 'member');
create type public.trip_status as enum ('planning', 'live', 'complete');
create type public.post_type as enum ('dispatch', 'photo', 'score_update', 'official_notice', 'rules_dispute');
create type public.round_status as enum ('planned', 'live', 'complete');

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_memberships (
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  role public.group_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, member_id)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  slug text not null,
  name text not null,
  city text,
  starts_on date,
  ends_on date,
  status public.trip_status not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, slug),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.trip_attendance (
  trip_id uuid not null references public.trips(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  attending boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (trip_id, member_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete restrict,
  type public.post_type not null default 'dispatch',
  body text not null default '' check (char_length(body) <= 5000),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  reaction text not null check (reaction in ('orange_jacket', 'mulligan', 'tough_scene', 'disputed', 'applause')),
  created_at timestamptz not null default now(),
  primary key (post_id, member_id, reaction)
);

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  course_name text not null,
  played_on date,
  format text not null default 'stroke_play',
  status public.round_status not null default 'planned',
  holes smallint not null default 18 check (holes between 1 and 36),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.round_players (
  round_id uuid not null references public.rounds(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  starting_handicap numeric(4,1),
  team text,
  created_at timestamptz not null default now(),
  primary key (round_id, member_id)
);

create table public.hole_scores (
  round_id uuid not null references public.rounds(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  hole_number smallint not null check (hole_number between 1 and 36),
  strokes smallint not null check (strokes between 1 and 20),
  entered_by uuid not null references public.members(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (round_id, member_id, hole_number),
  foreign key (round_id, member_id) references public.round_players(round_id, member_id) on delete cascade
);

create index posts_trip_created_idx on public.posts (trip_id, created_at desc);
create index comments_post_created_idx on public.comments (post_id, created_at);
create index post_reactions_post_idx on public.post_reactions (post_id);
create index rounds_trip_played_idx on public.rounds (trip_id, played_on);
create index hole_scores_round_idx on public.hole_scores (round_id, member_id);
create index memberships_member_idx on public.group_memberships (member_id, group_id);

alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.group_memberships enable row level security;
alter table public.trips enable row level security;
alter table public.trip_attendance enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.rounds enable row level security;
alter table public.round_players enable row level security;
alter table public.hole_scores enable row level security;

revoke all on table
  public.groups,
  public.members,
  public.group_memberships,
  public.trips,
  public.trip_attendance,
  public.posts,
  public.post_media,
  public.comments,
  public.post_reactions,
  public.rounds,
  public.round_players,
  public.hole_scores
from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table
  public.groups,
  public.members,
  public.group_memberships,
  public.trips,
  public.trip_attendance,
  public.posts,
  public.post_media,
  public.comments,
  public.post_reactions,
  public.rounds,
  public.round_players,
  public.hole_scores
to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trip-media',
  'trip-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.groups (id, slug, name)
values ('80800000-0000-4000-8000-000000000001', '808-cali-boys', '808 Cali Boys')
on conflict (id) do nothing;

insert into public.trips (id, group_id, slug, name, city, starts_on, ends_on, status)
values (
  '80800000-0000-4000-8000-000000002026',
  '80800000-0000-4000-8000-000000000001',
  '2026-seattle',
  '808 Classic 2026',
  'Seattle, WA',
  '2026-07-16',
  '2026-07-19',
  'planning'
)
on conflict (id) do nothing;

insert into public.rounds (trip_id, name, course_name, played_on, format)
values
  ('80800000-0000-4000-8000-000000002026', 'Thursday Warmup', 'Interbay Golf Center', '2026-07-16', 'stroke_play'),
  ('80800000-0000-4000-8000-000000002026', 'Friday Round', 'Jackson Park Golf Course', '2026-07-17', 'stroke_play'),
  ('80800000-0000-4000-8000-000000002026', 'Championship Round', 'Gold Mountain Golf Club', '2026-07-18', 'stroke_play');

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.post_reactions;
alter publication supabase_realtime add table public.hole_scores;
