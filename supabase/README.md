# 808 Classic Backend

The interactive backend uses three layers:

1. Cloudflare Access authenticates approved members by email.
2. Cloudflare Pages Functions verify that email is an active 808 member.
3. Supabase stores social posts, media, comments, reactions, rounds, and scores.

The browser must never receive the Supabase secret key. Public Supabase tables have
RLS enabled and no browser-facing policies; Pages Functions access them with the
server-only secret key after checking group membership.

## Environment Variables

Configure these as encrypted Cloudflare Pages environment variables:

```text
SUPABASE_URL=https://vjbjzgjudqnrtjipojds.supabase.co
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
SUPABASE_GROUP_ID=80800000-0000-4000-8000-000000000001
SUPABASE_TRIP_ID=80800000-0000-4000-8000-000000002026
```

Never create a variable whose name exposes `SUPABASE_SECRET_KEY` to browser code.

## Initial Provisioning

1. Create or connect a Supabase project.
2. Apply `migrations/202606090001_initial_808_backend.sql`.
3. Add members and memberships using their exact Cloudflare Access email addresses.
4. Add each attending member to `trip_attendance` and the appropriate `round_players`.
5. Configure the Cloudflare Pages environment variables above.

The Google Sheet remains the CMS for logistics. Supabase owns interactive, live,
and year-over-year data.

## Project

- Name: `808 Classic`
- Project reference: `vjbjzgjudqnrtjipojds`
- Region: `us-west-1`
