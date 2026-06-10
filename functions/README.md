# Cloudflare Pages Functions

These functions are the secure API boundary between Cloudflare Access and
Supabase.

Cloudflare Access validates requests before they reach the Pages Functions. The
API reads identity from the forwarded email header when available and falls back
to the validated Access JWT assertion or `CF_Authorization` cookie.

For local requests only, set `ENVIRONMENT=development` and pass the member email
in the `X-Dev-User-Email` header. Production requests ignore that header and
require Cloudflare's verified `Cf-Access-Authenticated-User-Email` header.

The API is intentionally not connected to the visible site yet. It can be
deployed after the Supabase migration, member seed, and Cloudflare Pages
environment variables are configured.
