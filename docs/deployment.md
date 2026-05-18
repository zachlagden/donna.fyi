# Deployment (Coolify)

donna.fyi is deployed via Coolify on a single VPS. Three Coolify resources in the "Donna Website And Related Services" project (uuid `w4ck4osg4w08w8sg40ccsg84`):

| Resource | UUID | Image | Role |
|---|---|---|---|
| `donna.fyi` (Next.js app) | `m48s4kg8o8o4cwgo8o048cgc` | nixpacks build | the site |
| `donna-blog-pg` (Postgres) | `r14o4ctcjt1xwpchlbcmitdv` | `postgres:16-alpine` | NextAuth + blog data |
| `donna-blog-redis` (Redis) | `iy3p61l2wrwxa4wgb9yp8nru` | `redis:7-alpine` | rate-limit sliding window |

## Required env vars

Set on the Next.js app in Coolify:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://donna_app:<password>@r14o4ctcjt1xwpchlbcmitdv:5432/donna_blog` | Runtime user is `donna_app` (least privilege). See "DB roles" below. |
| `REDIS_URL` | `redis://default:<password>@iy3p61l2wrwxa4wgb9yp8nru:6379/0` | Used by `lib/rate-limit/index.ts` and `proxy.ts`. |
| `NEXTAUTH_URL` / `AUTH_URL` | `https://donna.fyi` | Both keys set for NextAuth v4/v5 compat. |
| `AUTH_TRUST_HOST` | `true` | Required behind Cloudflare + Traefik. |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | `openssl rand -base64 32` | Both keys set. |
| `GITHUB_CLIENT_ID` | from prod OAuth app | https://github.com/settings/developers |
| `GITHUB_CLIENT_SECRET` | from prod OAuth app | Callback must be `https://donna.fyi/api/auth/callback/github`. |
| `BOOTSTRAP_ALLOWED_GITHUB_LOGIN` | `zachlagden` | First user lock. |
| `SITE_URL` | `https://donna.fyi` | Used by feed regen, sitemap. |
| `CRON_SECRET` | random 32 bytes | Shared with the Coolify scheduled task. |
| `USE_POSTGRES_SOURCE` | `1` | Switches `BlogDataSource` from mock to Postgres. |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | after wizard | See "Sentry (deferred)". |

## First-time setup

1. **GitHub OAuth app** at https://github.com/settings/developers:
   - Homepage: `https://donna.fyi`
   - Callback: `https://donna.fyi/api/auth/callback/github`
   - Copy `Client ID` and `Client Secret` to Coolify env.

2. **Postgres + Redis** services already deployed.

3. **Deploy the Next.js app** with all env vars set.

4. **Run migrations** (one-time, requires superuser):
   ```sh
   ssh personal-vps "docker exec -e DATABASE_URL='postgres://donna:<SUPERUSER_PASSWORD>@r14o4ctcjt1xwpchlbcmitdv:5432/donna_blog' \$(docker ps --format '{{.Names}}' | grep '^m48s4kg8') pnpm db:migrate"
   ```
   Note: the runtime `DATABASE_URL` points at `donna_app` (least privilege). Migrations need the superuser, so override the env explicitly when running `pnpm db:migrate`.

5. **Sign in once** at `https://donna.fyi/admin/login` to bootstrap your `users` row.

6. **Mint API keys** at `/admin/keys`. Plaintext shows once, copy it immediately.

## DB roles

Two Postgres roles:

- **`donna`** (superuser, password set during PG container provisioning). Used only for migrations and one-off admin tasks. Never exposed via `DATABASE_URL`.
- **`donna_app`** (CRUD on existing tables + sequences only). Used by the running app via `DATABASE_URL`.

Verified by running `CREATE TABLE evil (x int)` as `donna_app` and confirming `ERROR: permission denied for schema public`.

To rotate the `donna_app` password:
```sql
-- As donna superuser
ALTER ROLE donna_app WITH PASSWORD '<new>';
```
Then update `DATABASE_URL` in Coolify env and redeploy.

## Scheduled task (Coolify)

Promote scheduled-but-unpublished posts every 5 minutes:

- Schedule: `*/5 * * * *`
- Command: `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://donna.fyi/api/cron/promote-scheduled`

## Backups

Coolify's Postgres service supports `pg_dump` snapshots. Enable daily snapshots in the PG service settings.

## Rate limiting

`proxy.ts` rate-limits `/api/v1/*` via Redis sorted-set sliding windows:

- **Per IP** (`CF-Connecting-IP` preferred): 60 req / 60 s
- **Per bearer key** (first 32 chars of token): 600 req / 60 s

Returns 429 with `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` headers. Fail-open if Redis is down.

## Sentry (deferred)

The Sentry SDK was not wired during the initial implementation because the wizard needs a live DSN and interactive prompts. To enable it post-deploy:

1. Create a Next.js project in Sentry.
2. Run locally:
   ```sh
   pnpm dlx @sentry/wizard@latest -i nextjs
   ```
3. Commit the generated config files.
4. Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` in Coolify env.
5. Redeploy.

## Build pack note

The Coolify build pack is `nixpacks`. Confirmed working with `@node-rs/argon2`, `shiki`, `@mdx-js/mdx`, `next-auth@beta`, `postgres`, `ioredis` as of 2026-05-18. If a future native dep trips nixpacks, switch to `dockerfile` (zachlagden.uk made this switch during its v2 milestone and has a working Dockerfile to reference).
