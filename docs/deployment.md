# Deployment (Coolify)

Two services in the existing Coolify project ("Donna Website And Related Services", uuid `w4ck4osg4w08w8sg40ccsg84`):

1. **Next.js app** (existing, uuid `m48s4kg8o8o4cwgo8o048cgc`). Update env vars:
   - `DATABASE_URL` — points to the PG service below
   - `NEXTAUTH_URL=https://donna.fyi`
   - `NEXTAUTH_SECRET` — generate via `openssl rand -base64 32`
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — from the prod OAuth app
   - `BOOTSTRAP_ALLOWED_GITHUB_LOGIN=zachlagden`
   - `SITE_URL=https://donna.fyi`
   - `CRON_SECRET` — random 32-byte value, shared with the Coolify scheduled task
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — optional, rate limiting is a no-op without them
   - `USE_POSTGRES_SOURCE=1`
   - `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` — only after running the Sentry wizard locally (see below)

2. **PostgreSQL 16 service** (new container). Coolify ships a Postgres template, deploy from that. Capture the connection string into `DATABASE_URL`.

## Initial setup steps

1. Create the GitHub OAuth app at https://github.com/settings/developers:
   - Homepage: `https://donna.fyi`
   - Callback: `https://donna.fyi/api/auth/callback/github`
   - Copy `Client ID` and `Client Secret` to Coolify env.

2. Deploy the Postgres service.

3. Deploy the app with all env vars set.

4. Run migrations from inside the app container:
   ```sh
   pnpm db:migrate
   ```

5. Visit `https://donna.fyi/admin/login` and sign in with your GitHub account. The signIn callback will bootstrap the first user (locked to `BOOTSTRAP_ALLOWED_GITHUB_LOGIN`).

6. Mint API keys at `/admin/keys` — one for Donna (deployed to the Hetzner box), optionally one for Zach.

## Scheduled task (Coolify Scheduled Tasks)

Add a scheduled task to promote scheduled-but-unpublished posts:

- Schedule: `*/5 * * * *` (every 5 minutes)
- Command: `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://donna.fyi/api/cron/promote-scheduled`

## Backups

Coolify's Postgres service supports `pg_dump`-based snapshots. Enable daily snapshots in the service settings.

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

The current Coolify build pack is `nixpacks`. If the new native deps (`@node-rs/argon2`, `shiki`, `@mdx-js/mdx`, `next-auth`, `postgres`) trip the nixpacks build, switch to `dockerfile`. The donna.fyi sibling site `zachlagden.uk` made the same switch during its v2 milestone and has a working Dockerfile to reference.

## DB role separation (follow-up)

The app currently connects as the migration user (superuser). After bootstrap, create a least-privilege application role:

```sql
CREATE ROLE donna_app LOGIN PASSWORD '...';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO donna_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO donna_app;
```

Then point `DATABASE_URL` at `donna_app` instead of the bootstrap user. Migrations still run as the bootstrap user via `pnpm db:migrate`.
