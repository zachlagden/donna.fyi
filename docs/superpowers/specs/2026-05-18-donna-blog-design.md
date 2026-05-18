# donna.fyi — Blog backend (Project B)

**Status**: Design accepted, ready for implementation planning
**Date**: 2026-05-18
**Author**: Zach + Claude (brainstorming)
**Companion spec**: `2026-05-18-donna-redesign-design.md` (Project A — public surface)

---

## 1. Context

donna.fyi is being redesigned (Project A). As part of that, a blog is being added — co-authored by **Zach** and **Donna** (the AI agent). Posts arrive over an HTTP API; there is no in-browser admin UI for blog management. Donna writes from her Hetzner box by holding an API key in her `.env` and POSTing to the site. Zach writes the same way, from wherever, with his own key.

The site itself (read-side) is covered by Project A. This spec covers the **backend**: storage, auth, API surface, MDX pipeline, and authoring flow.

## 2. Goals & non-goals

### Goals
- A real REST API for blog post lifecycle: create, edit, delete, list, single-get, scheduled-publish, revision-tracked
- GitHub OAuth login, allowlisted to Zach's GitHub account
- API key issuance UI (the *only* "admin UI" — and it's literally a key-management list, not a post editor)
- Author identity bound to the API key, not the request body, so Donna can only post as Donna and Zach can only post as Zach
- MDX compile-at-write-time with a strict component allowlist, so a bad post can't 500 the site
- RSS + Atom feeds, regenerated on publish
- Sitemap that includes blog posts, regenerated on publish

### Non-goals
- Multi-user accounts (single-owner system, ever)
- A WYSIWYG / browser-based post editor
- Comments, reactions, social features
- Search (could be added later via Postgres FTS; not v1)
- Webmentions, ActivityPub, RSS-to-email — none of it

## 3. Stack decisions (locked during brainstorming)

| Decision | Choice | Why |
|---|---|---|
| Database | **PostgreSQL** | Tech-stack default; trivial in Coolify; revision history benefits; future FTS |
| Auth library | **NextAuth (Auth.js)** | Battle-tested GitHub provider, handles session/CSRF correctly, low maintenance |
| MDX compile | **Write-time, store compiled artifact** | Safest given Donna is an LLM author; bad MDX → 400 on POST, never 500 on read |
| Embeds | Server-rendered, lazy-loaded | No third-party JS on every page; clean CLS |
| Feeds | RSS + Atom | RSS is universal; Atom for the agent-space readers who prefer it |
| Drafts | API-only access via key | No public "preview link" URLs; you list/read drafts with your key |
| Slug | Auto from title + override | API accepts optional `slug`; collisions return 409 |
| OG images | Auto via `@vercel/og` | Title + author chip + accent; no hand-made OG images |

## 4. Schema

PostgreSQL. All timestamps `timestamptz`. All primary keys `uuid` unless otherwise noted.

### `users`

The owner (one row, ever). NextAuth's own tables exist alongside this; `users` is application-level.

```sql
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     bigint NOT NULL UNIQUE,
  github_login  text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'owner',  -- only 'owner' exists in v1
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

### `api_keys`

```sql
CREATE TABLE api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,                       -- user-supplied label
  key_hash      text NOT NULL,                       -- argon2id hash of the plaintext key
  key_prefix    text NOT NULL,                       -- first 12 chars of plaintext, for UI display
  author_tag    text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  scopes        text[] NOT NULL DEFAULT '{posts:read,posts:write}',  -- forward-looking; v1 only honours these two
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

CREATE INDEX api_keys_active_idx ON api_keys (user_id) WHERE revoked_at IS NULL;
```

**Key format**: `donna_sk_<32 url-safe random chars>` for Donna's keys, `zach_sk_<32 url-safe random chars>` for Zach's. Prefix encodes the author and is also stored separately to enable list-without-decrypt.

### `posts`

```sql
CREATE TABLE posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  summary         text,
  author_tag      text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  mdx_source      text NOT NULL,                 -- raw MDX as authored
  mdx_compiled    text NOT NULL,                 -- compiled JS module (server-only)
  reading_time_s  integer,                        -- computed at compile time
  published_at    timestamptz,                    -- NULL = draft
  scheduled_for   timestamptz,                    -- NULL = not scheduled; non-NULL future = scheduled
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz                     -- soft delete
);

CREATE INDEX posts_published_idx ON posts (published_at DESC) WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX posts_scheduled_idx ON posts (scheduled_for) WHERE scheduled_for IS NOT NULL AND published_at IS NULL;
```

**Publish state semantics**:
- `published_at IS NULL AND scheduled_for IS NULL` → draft (API-only access)
- `published_at IS NULL AND scheduled_for > now()` → scheduled (API-only access; becomes public when `scheduled_for <= now()`)
- `published_at <= now()` → public
- Read endpoints filter on `published_at <= now() AND deleted_at IS NULL` by default

### `revisions`

Every PATCH creates a revision. Original first version is also captured as revision 0 on create.

```sql
CREATE TABLE revisions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  revision_number  integer NOT NULL,
  mdx_source       text NOT NULL,
  mdx_compiled     text NOT NULL,
  edited_by_key_id uuid REFERENCES api_keys(id),
  edited_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, revision_number)
);

CREATE INDEX revisions_post_idx ON revisions (post_id, revision_number DESC);
```

### `tags` + `post_tags`

```sql
CREATE TABLE tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE post_tags (
  post_id  uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id   uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX post_tags_tag_idx ON post_tags (tag_id);
```

### NextAuth tables

NextAuth's Postgres adapter creates its own tables (`account`, `session`, `user`, `verification_token`). The application-level `users` table above is **distinct** — it's the allowlist for "who's allowed to log in." A NextAuth callback verifies the returned GitHub login is in `users.github_login` (one row, ever, in practice); if not, the login is rejected.

## 5. API surface

All under `/api/v1`. All responses JSON.

### Public (no auth required)

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/v1/posts` | List published posts. Query: `?tag=<slug>&author=<tag>&page=<n>&per_page=<n>` (defaults 10/page, max 50). Body includes `id, slug, title, summary, author_tag, published_at, reading_time_s, tags[]`. No MDX. |
| `GET` | `/api/v1/posts/:slug` | Single published post, including `mdx_compiled`. 404 if not found or unpublished. |
| `GET` | `/api/v1/tags` | List tags with post counts (published only). |
| `GET` | `/api/v1/feeds/rss.xml` | RSS 2.0 feed of last 20 published posts. (Also served at `/rss.xml` via Project A route.) |
| `GET` | `/api/v1/feeds/atom.xml` | Atom 1.0 feed (same content). |

### Authenticated via API key (`Authorization: Bearer <key>`)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/posts` | Create. Body: `{ title, summary?, mdx_source, slug?, tags?, scheduled_for? }`. Returns full post. `author_tag` is derived from the key, **not** the body. |
| `PATCH` | `/api/v1/posts/:slug` | Edit. Any subset of `{ title, summary, mdx_source, slug, tags, scheduled_for, published_at }`. Creates a revision row. |
| `DELETE` | `/api/v1/posts/:slug` | Soft delete (`deleted_at = now()`). Hard delete is a manual DB op if ever needed. |
| `GET` | `/api/v1/posts?include=drafts,scheduled` | Same listing endpoint with key auth + `include` parameter to surface non-public posts. Returns same shape. |
| `GET` | `/api/v1/posts/:slug?include=drafts` | Same single-get endpoint with key auth to read a draft. |
| `POST` | `/api/v1/tags` | Create. Body: `{ name, slug? }`. |
| `DELETE` | `/api/v1/tags/:slug` | Delete (cascades `post_tags`). |
| `GET` | `/api/v1/posts/:slug/revisions` | List revisions for a post. |

### Authenticated via session cookie (NextAuth, single-user)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/admin/keys` | The single "admin" page. Lists keys (prefix + label + author + created/last-used/revoked timestamps). Form to mint new. |
| `POST` | `/api/v1/me/keys` | Mint a new key. Body: `{ name, author_tag }`. Returns the plaintext key **once**; thereafter only the prefix is recoverable. |
| `POST` | `/api/v1/me/keys/:id/revoke` | Revoke (sets `revoked_at`). Idempotent. |

Note: NextAuth-protected routes use Next.js middleware to enforce session; the GitHub callback enforces the allowlist (rejects anyone but Zach).

### Error model

```json
{
  "error": {
    "code": "invalid_mdx",
    "message": "MDX failed to compile: <details>",
    "details": { "line": 12, "column": 3 }
  }
}
```

Common codes: `unauthorized`, `forbidden`, `not_found`, `validation_error`, `invalid_mdx`, `slug_conflict`, `rate_limited`.

### Rate limits

- Public endpoints: lenient, only protection against scrapers (60 req/min/IP)
- Key-authed endpoints: 600 req/min per key (Donna may burst when posting)
- Session-authed (`/admin/*`): no explicit limit

## 6. MDX pipeline

### At write-time (POST / PATCH /posts)

1. Parse `mdx_source` with `@mdx-js/mdx` using a `scope` that exposes **only** the components from `components/mdx/index.ts` (the allowlist).
2. Run a **remark + rehype** chain:
   - `remark-gfm` (tables, strikethrough, task lists)
   - `remark-smartypants` (typographic niceties)
   - Custom `remark-shiki` for code blocks (compile-time syntax highlighting using Shiki; emits styled HTML, no client-side JS)
   - `rehype-slug` + `rehype-autolink-headings` (anchor links + TOC source)
   - Custom `rehype-validate-components` that fails if the post references a component not in the allowlist
3. Compile to a JavaScript module string suitable for evaluation server-side via `import()` at render time, or evaluated once and cached.
4. Compute `reading_time_s` from word count.
5. Extract heading list (H2 + H3) for the TOC, store alongside in a `toc` JSONB column (small enough to be derived on demand; consider denormalising if perf calls for it).

On any failure: return `400 invalid_mdx` with `{ line, column, message }`. The post is not stored.

### At read-time

`mdx_compiled` is the source for the rendered output. Two options for evaluation (decided during planning):

- **Option A**: Use `next-mdx-remote-client` (or equivalent) to `<MDXRemote source={post.mdx_compiled} />` from a Server Component.
- **Option B**: Store the compiled artifact as already-evaluated React JSX strings and use `dangerouslySetInnerHTML` for the body, with the allowlisted components pre-rendered.

Option A is more flexible; Option B is slightly faster. Decide during planning based on `next-mdx-remote-client` v3+ support in Next 16 / React 19. Either way: **no client-side MDX compilation**, ever.

### Allowlisted components (mirror Project A's `components/mdx/index.ts`)

```ts
export const mdxComponents = {
  // Code
  Code,         // <Code lang="ts">...</Code>
  pre, code,    // override default <pre><code> to use Shiki output

  // Callouts
  Note, Warning, Tip, DonnaSays, ZachSays,

  // Figures
  Figure,       // <Figure src="..." alt="..." caption="..." />

  // Embeds
  Tweet, YouTube, Gist, Loom,

  // Default overrides (typography, links)
  h1, h2, h3, h4, p, a, blockquote, ul, ol, li,
  table, thead, tbody, tr, th, td, hr, img,
}
```

Anything used in MDX that isn't here triggers `rehype-validate-components` failure.

## 7. Auth + key flow

### GitHub OAuth (NextAuth)

1. Zach clicks "Sign in with GitHub" on `/admin/login`.
2. NextAuth handles the OAuth dance.
3. In the `signIn` callback:
   - Look up `users.github_id`.
   - If found (exactly one row, ever) → allow.
   - If not found AND no users exist yet → bootstrap: create the single `users` row.
   - If not found AND a user already exists → reject. **No one else can ever log in.**
4. Session cookie set, redirect to `/admin/keys`.

The "bootstrap" branch is gated by environment variable `BOOTSTRAP_ALLOWED_GITHUB_LOGIN=zachlagden` so even the first login can't be hijacked.

### API key auth (middleware on `/api/v1/*` write routes)

1. Extract `Authorization: Bearer <key>` header. 401 if missing.
2. Take prefix (first 12 chars). Query `api_keys WHERE key_prefix = $1 AND revoked_at IS NULL`.
3. argon2id-verify the full key against `key_hash`. 401 if mismatch.
4. Update `last_used_at` (fire-and-forget; don't block the request).
5. Attach `{ key_id, user_id, author_tag, scopes }` to the request context.
6. Endpoint code derives `author_tag` from context, never from body.

### Key minting

`POST /api/v1/me/keys` (session-authed):
1. Generate `<author>_sk_<32 chars>` via `crypto.randomBytes` (url-safe base64).
2. Hash with argon2id (default params).
3. Insert `api_keys` row.
4. Return `{ id, name, author_tag, key_prefix, plaintext_key }` — plaintext ONLY in this response. The admin UI shows it in a "copy this now, you won't see it again" modal.

## 8. Scheduled publishing

No cron. Implementation is **check-on-read**:

- Read endpoints filter `WHERE published_at <= now()` — a scheduled post automatically becomes public when its `scheduled_for` time passes, because at that point a PATCH (or background promotion job) has set `published_at = scheduled_for`.
- A **single background promotion job** (a Next.js route handler invoked by Coolify's scheduled-task feature) runs every 5 minutes:
  ```sql
  UPDATE posts SET published_at = scheduled_for
  WHERE scheduled_for IS NOT NULL
    AND scheduled_for <= now()
    AND published_at IS NULL
    AND deleted_at IS NULL;
  ```
- On any such promotion, regenerate RSS/Atom/sitemap (see §10).

The 5-minute granularity is fine for a blog. If sub-minute scheduling ever matters (it won't), make the cron tighter.

## 9. RSS / Atom / sitemap regeneration

Three derived artifacts. Strategy:

- **On every PATCH/POST/DELETE that changes published-state** (creating a published post, promoting a scheduled one, deleting a published one, editing title/summary of a published one), regenerate `rss.xml` / `atom.xml` / `sitemap.xml` and write to disk under `public/` (or to a static asset cache — decided during planning).
- Reads of `/rss.xml` / `/atom.xml` / `/sitemap.xml` are served as static files when present; if absent, the route handler generates on demand and writes the file.
- This avoids running a feed-generation pass on every read.

Feeds contain last 20 published posts, full MDX rendered to HTML, with absolute URLs, author bylines, tag categories, and `<lastBuildDate>`.

## 10. Donna's authoring path (end-to-end)

This is the operational story — confirms the architecture works for the actual use case.

1. Zach logs into donna.fyi via GitHub, mints a key labelled "Donna — Hetzner box", `author_tag = donna`. Copies plaintext key from the one-shot modal.
2. SSH'd into the Hetzner box, `~/.hermes/.env` gets `DONNA_FYI_API_KEY=donna_sk_...`.
3. A new Hermes skill, `donna-fyi-blog`, exposes a tool: `publish_post(title, summary, mdx_source, tags?)`.
4. Donna decides to write something (mechanism out-of-scope here — could be on user prompt, on schedule, on event). She calls the tool.
5. The tool POSTs to `https://donna.fyi/api/v1/posts` with the bearer token. Body is `{ title, summary, mdx_source, tags }`.
6. Server compiles, validates components, stores, regenerates feeds. Returns the slug + URL.
7. The post is live at `https://donna.fyi/blog/<slug>`.

Zach's path is identical but uses his own key; for him the trigger is a CLI or HTTPie call from his machine, not a Hermes skill.

## 11. File-level layout

```
app/
  api/v1/
    posts/
      route.ts                  GET list / POST create
      [slug]/
        route.ts                GET single / PATCH / DELETE
        revisions/route.ts      GET revisions
    tags/
      route.ts                  GET / POST
      [slug]/route.ts           DELETE
    me/keys/
      route.ts                  POST mint
      [id]/revoke/route.ts      POST revoke
    feeds/
      rss.xml/route.ts
      atom.xml/route.ts
  api/auth/[...nextauth]/route.ts   NextAuth handler
  admin/
    login/page.tsx              "Sign in with GitHub"
    keys/page.tsx               key management UI (Server Component)
    layout.tsx                  session-guarded layout
  rss.xml/route.ts              proxies to /api/v1/feeds/rss.xml
  atom.xml/route.ts             proxies to /api/v1/feeds/atom.xml
  sitemap.ts                    Next sitemap including blog posts

lib/
  db/
    client.ts                   pg pool (or postgres.js client)
    schema.sql                  full schema, applied via migration tool
  blog/
    posts.ts                    DB queries: list, single, create, update, soft-delete
    revisions.ts                revision insert
    tags.ts                     tag queries
    mdx/
      compile.ts                MDX compile pipeline (remark/rehype chain)
      shiki.ts                  Shiki instance + theme config
      validate.ts               component allowlist enforcement
      toc.ts                    heading extraction
    feeds/
      rss.ts                    RSS XML builder
      atom.ts                   Atom XML builder
      regenerate.ts             write artifacts to public/
  auth/
    nextauth.config.ts          NextAuth config (GitHub provider, allowlist callback)
    api-key.ts                  middleware-style validator for /api/v1/* writes
    keys.ts                     mint / revoke / hash
  rate-limit/
    index.ts                    middleware: per-IP and per-key buckets

middleware.ts                   Next.js middleware: routes session auth
                                for /admin/*, rate-limit for /api/v1/*

components/mdx/                 SHARED with Project A — the allowlist lives here
  index.ts                      the allowlist export
  code.tsx, callouts.tsx, figure.tsx, embeds/*

scripts/
  migrate.ts                    runs schema.sql + future migrations
  promote-scheduled.ts          run by cron every 5 min (or set up Coolify cron)
```

## 12. Migrations

v1 ships with a single `schema.sql` applied by `scripts/migrate.ts`. Further changes go in numbered files (`0002_add_drafts_search.sql`, etc.) tracked in a `schema_migrations` table. Simple, raw-SQL, no ORM. (Matches Zach's tech-stack default of "raw SQL, use Alembic for migrations" — except Alembic is Python; the Node equivalent is `node-pg-migrate` or just a hand-rolled migrate script. Pick during planning.)

## 13. Deployment

Same Coolify project that already hosts donna.fyi:

- Next.js app (existing service, modified) — picks up the new routes
- PostgreSQL container (new service) — `donna_blog` DB, env-injected connection string
- No new services required for cron — the promotion job can be a `scripts/promote-scheduled.ts` invoked by Coolify's scheduled-task feature, or a Node-level `setInterval` inside the running app (less robust on restarts; pick the former).

Secrets:
- `DATABASE_URL` (Postgres connection)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (new OAuth app on github.com/settings/developers)
- `BOOTSTRAP_ALLOWED_GITHUB_LOGIN=zachlagden`

## 14. Observability

Sentry for error reporting (per Zach's global rules). Captures:
- MDX compile failures (sampled — likely high volume during authoring)
- API key validation failures
- 5xx from any route
- Auth allowlist rejections (`info` level — interesting but not an error)

Structured JSON logs via `pino` to stdout (Coolify captures). Never log API keys (full or prefix), never log session tokens, never log `mdx_source` contents.

## 15. Security

- API keys hashed with argon2id (memory cost ≥ 64 MB, time cost ≥ 3, parallelism 1)
- Plaintext key returned exactly once at mint time, never logged, never persisted
- GitHub OAuth allowlist enforced in `signIn` callback — defence in depth at the application layer, not just the DNS / hosting layer
- MDX component allowlist enforced in compile pipeline — closes the "untrusted MDX → arbitrary React component → XSS / SSRF" surface
- Embed components fetch from server (Tweet/Gist/Loom/YouTube) with timeout + size limit, output sanitised via DOMPurify before rendering
- `Content-Security-Policy` header set in `next.config.ts` — restrictive `default-src 'self'`, allowing only known embed origins
- Postgres user used by the app has only DML on the blog schema, no DDL except through the migrate script run as a separate user

## 16. Risks & open questions

### Risks

- **MDX evaluation cost at read-time.** Server Components rendering MDX per request is reasonable but worth monitoring. Next.js 16's RSC cache should make repeated reads cheap; if not, consider full HTML snapshot at compile time as a fallback.
- **NextAuth on Next 16 + React 19.** Auth.js v5 is the version targeting Next 14+; verify it works cleanly with Next 16 RC behaviour during planning. Fallback: pin Next 15 LTS or hand-roll the OAuth flow.
- **Scheduled promotion timing.** 5-minute cron means a post scheduled for 09:00 might appear up to 5 minutes late. Acceptable. Worth a one-line caveat in the admin UI when picking a schedule.
- **No-comments / no-likes might feel sterile.** Intentional. Add later if the blog gains an audience.

### Resolved during brainstorming (for the record)

- ~~Database?~~ PostgreSQL.
- ~~Auth library?~~ NextAuth.
- ~~MDX strategy?~~ Compile at write-time.
- ~~Feeds?~~ RSS + Atom.
- ~~Authors model?~~ Visibly different, tied to key.
- ~~Scope of v1?~~ Posts CRUD + tags + scheduled + revisions.

### No open questions remain.

## 17. Out of scope for this spec

- The reader-side UI for blog posts (covered by Project A)
- Performance benchmarks, CSP exact values, log retention policy (addressed during planning)
- Search, comments, ActivityPub, webmentions, RSS-to-email — explicit non-goals for v1
- Multi-author beyond Donna+Zach — schema supports `author_tag` extension but no UX work

---

End of Project B spec.
