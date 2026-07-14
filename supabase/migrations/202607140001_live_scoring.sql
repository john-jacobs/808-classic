alter table public.rounds
  add column if not exists sort_order integer not null default 0,
  add column if not exists points_enabled boolean not null default true;

create table public.round_teams (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (round_id, name)
);

create table public.round_team_members (
  team_id uuid not null references public.round_teams(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, member_id)
);

create table public.team_hole_scores (
  round_id uuid not null references public.rounds(id) on delete cascade,
  team_id uuid not null references public.round_teams(id) on delete cascade,
  hole_number smallint not null check (hole_number between 1 and 36),
  strokes smallint not null check (strokes between 1 and 20),
  entered_by uuid not null references public.members(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (round_id, team_id, hole_number)
);

create table public.drink_cards (
  trip_id uuid not null references public.trips(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  allotment smallint not null default 0 check (allotment between 0 and 200),
  consumed smallint not null default 0 check (consumed between 0 and 200),
  mulligans smallint not null default 0 check (mulligans between 0 and 200),
  updated_by uuid references public.members(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (trip_id, member_id),
  check (mulligans <= consumed)
);

create index if not exists round_teams_round_sort_idx on public.round_teams (round_id, sort_order);
create index if not exists round_team_members_member_idx on public.round_team_members (member_id);
create index if not exists team_hole_scores_round_idx on public.team_hole_scores (round_id, team_id);
create index if not exists drink_cards_trip_idx on public.drink_cards (trip_id);
create index if not exists rounds_trip_sort_idx on public.rounds (trip_id, sort_order);

alter table public.round_teams enable row level security;
alter table public.round_team_members enable row level security;
alter table public.team_hole_scores enable row level security;
alter table public.drink_cards enable row level security;

revoke all on table
  public.round_teams,
  public.round_team_members,
  public.team_hole_scores,
  public.drink_cards
from anon, authenticated;

grant select, insert, update, delete on table
  public.round_teams,
  public.round_team_members,
  public.team_hole_scores,
  public.drink_cards
to service_role;

update public.rounds
set
  sort_order = case
    when name ilike '%warmup%' then 1
    when name ilike '%friday%' then 2
    when name ilike '%championship%' then 3
    else sort_order
  end,
  format = case
    when name ilike '%friday%' then 'scramble'
    else 'individual'
  end,
  points_enabled = true,
  updated_at = now()
where trip_id = '80800000-0000-4000-8000-000000002026';

update public.trips
set
  settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{scoring}',
    coalesce(settings->'scoring', '{}'::jsonb) || jsonb_build_object(
      'points_by_position',
      coalesce(settings->'scoring'->'points_by_position', '[10, 7, 5, 3, 2, 1, 0]'::jsonb),
      'drink_allotment',
      coalesce(settings->'scoring'->'drink_allotment', '0'::jsonb)
    ),
    true
  ),
  updated_at = now()
where id = '80800000-0000-4000-8000-000000002026';

alter publication supabase_realtime add table public.team_hole_scores;
alter publication supabase_realtime add table public.drink_cards;
