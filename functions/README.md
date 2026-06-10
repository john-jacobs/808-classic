# Cloudflare Pages Functions

These functions are the secure API boundary between Cloudflare Access and
Supabase.

For local requests only, set `ENVIRONMENT=development` and pass the member email
in the `X-Dev-User-Email` header. Production requests ignore that header and
require Cloudflare's verified `Cf-Access-Authenticated-User-Email` header.

The API is intentionally not connected to the visible site yet. It can be
deployed after the Supabase migration, member seed, and Cloudflare Pages
environment variables are configured.
