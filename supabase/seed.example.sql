-- Replace the sample addresses with the exact emails approved in Cloudflare Access.
-- The backend matches members to Cloudflare identity by email.

insert into public.members (id, email, display_name)
values
  ('80800000-0000-4000-8001-000000000001', 'john@example.com', 'John Jacobs'),
  ('80800000-0000-4000-8001-000000000002', 'evan@example.com', 'Evan Rodrigues')
on conflict (email) do update
set display_name = excluded.display_name;

insert into public.group_memberships (group_id, member_id, role)
values
  ('80800000-0000-4000-8000-000000000001', '80800000-0000-4000-8001-000000000001', 'owner'),
  ('80800000-0000-4000-8000-000000000001', '80800000-0000-4000-8001-000000000002', 'member')
on conflict (group_id, member_id) do update
set role = excluded.role;

insert into public.trip_attendance (trip_id, member_id)
values
  ('80800000-0000-4000-8000-000000002026', '80800000-0000-4000-8001-000000000001'),
  ('80800000-0000-4000-8000-000000002026', '80800000-0000-4000-8001-000000000002')
on conflict (trip_id, member_id) do nothing;
