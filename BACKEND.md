# Backend Architecture

## Product Boundary

Google Sheets remains responsible for slower-changing logistics and editorial copy.
Supabase owns live, interactive, and historical data:

- groups and members
- annual trips and attendance
- social posts, photos, comments, and reactions
- rounds, players, and hole-by-hole scores

## Identity And Authorization

Cloudflare Access remains the login system. Every request to `/api/*` reaches a
Cloudflare Pages Function, which reads the verified
`Cf-Access-Authenticated-User-Email` header and matches it to a Supabase member.

The browser never receives a Supabase secret key. Supabase tables are protected
with RLS and have no `anon` or `authenticated` grants. Only the Pages Functions
use the server-only Supabase secret key after checking group membership.

## First API Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Verify Access identity and backend connectivity |
| `/api/session` | GET | Return the current 808 member and active trip |
| `/api/feed` | GET | Return the active trip's latest posts |
| `/api/posts` | POST | Create a feed post |
| `/api/comments` | POST | Comment on a post in the active trip |
| `/api/reactions` | POST / DELETE | Add or remove an 808-specific reaction |
| `/api/scores` | POST | Upsert one player's score for one hole |

## First Deployment Checklist

1. Reconnect the Supabase connector or create a Supabase project.
2. Apply `supabase/migrations/202606090001_initial_808_backend.sql`.
3. Seed members using exact Cloudflare Access email addresses.
4. Add encrypted Cloudflare Pages environment variables documented in
   `supabase/README.md`.
5. Redeploy Cloudflare Pages.
6. Visit `/api/health` while signed in through Cloudflare Access.

## Near-Term Product Work

The first visible feature should be the live feed:

1. session-aware composer
2. latest posts
3. comments and 808-specific reactions
4. photo upload with signed private-media URLs
5. score entry and automatic score-update posts
