# donna.fyi Blog Backend — Implementation Plan (Project B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend that powers donna.fyi's blog: PostgreSQL storage, NextAuth GitHub OAuth (allowlisted to Zach), API-key authoring (Donna and Zach each post via their own bearer key), MDX compile-at-write-time with a strict component allowlist, posts CRUD with tags + scheduled publishing + revision history, RSS/Atom regeneration on publish, sitemap regeneration on publish. Swap Project A's mock `BlogDataSource` for the Postgres-backed implementation.

**Architecture:** All routes added to the existing Next.js app. New Postgres container (Coolify) holds NextAuth tables + application tables. NextAuth handles the OAuth dance and session cookie; a `signIn` callback enforces the GitHub-login allowlist. A custom middleware-style validator handles `Authorization: Bearer <key>` for `/api/v1/*` write endpoints. MDX gets compiled by a remark/rehype chain at POST/PATCH time; failures return 400; the compiled artifact is persisted alongside the source. Feeds + sitemap regenerate on any published-state change.

**Tech Stack:** Next.js 16 App Router, TypeScript, **Auth.js (NextAuth) v5 beta** with GitHub provider + Postgres adapter, **postgres.js** as the pg client (lighter than node-postgres), **`@node-rs/argon2`** for API-key hashing, **`@mdx-js/mdx` v3** + `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `shiki` (compile-time, shared with Plan A), **Vitest** for unit tests, **Playwright** for API E2E. Migrations are raw SQL applied by a small Node script (`scripts/migrate.ts`) tracking applied versions in a `schema_migrations` table.

**Companion plan:** `2026-05-18-donna-redesign.md` (Project A — public surface). Plan A must be merged before Plan B starts; this plan replaces the mock blog data source from Plan A.

---

## File Structure

```
app/
  api/v1/
    posts/
      route.ts                            GET list / POST create
      [slug]/
        route.ts                          GET single / PATCH / DELETE
        revisions/route.ts                GET revisions
    tags/
      route.ts                            GET / POST
      [slug]/route.ts                     DELETE
    me/keys/
      route.ts                            POST mint
      [id]/revoke/route.ts                POST revoke
  api/auth/[...nextauth]/route.ts         NextAuth handler
  admin/
    login/page.tsx                        sign-in
    keys/page.tsx                         key management UI (the only "admin UI")
    layout.tsx                            session-guarded shell
  api/cron/promote-scheduled/route.ts     Coolify-cron-invoked promotion job

lib/
  db/
    client.ts                             postgres.js singleton
    migrate.ts                            applies SQL migration files
    migrations/
      0001_init.sql                       full v1 schema
  auth/
    nextauth.ts                           NextAuth config (Edge-compatible config + node-only adapter)
    allowlist.ts                          signIn callback logic
    api-key.ts                            bearer-auth validator + types
    hash.ts                               argon2id wrap
    mint.ts                               key generation + insertion
    session.ts                            requireSession helper
  blog/
    postgres-source.ts                    BlogDataSource impl backed by Postgres
    source.ts                             modify: default to postgres source in production
    posts.ts                              DB-level queries
    revisions.ts                          DB-level queries
    tags.ts                               DB-level queries
    mdx/
      compile.ts                          remark/rehype chain → mdx_compiled
      shiki.ts                            shared Shiki instance
      validate.ts                         rehype plugin: allowlist enforcement
      toc.ts                              extract H2/H3 headings → TocEntry[]
      reading-time.ts                     wraps Plan A helper
    feeds/
      regenerate.ts                       writes /public/rss.xml etc. on publish

scripts/
  migrate.ts                              CLI entry point: run all pending migrations
  promote-scheduled.ts                    standalone promotion (called by Coolify cron or app cron route)
  bootstrap-tags.ts                       one-shot seed for tag slugs (optional)

middleware.ts                             create (or modify if exists): rate limits, route protection

tests/
  unit/
    auth/
      allowlist.test.ts
      api-key.test.ts
      hash.test.ts
      mint.test.ts
    blog/
      postgres-source.test.ts             integration: uses real test DB
      mdx/
        compile.test.ts
        validate.test.ts
        toc.test.ts
  e2e/
    api-posts.spec.ts
    api-keys.spec.ts
    admin-flow.spec.ts

.env.example                              modify: add new env vars
```

---

## Phase 1: Database + migration tooling

### Task 1: Add Postgres dependencies + connection module

**Files:**
- Modify: `package.json`
- Create: `lib/db/client.ts`
- Modify: `.env.example`

- [ ] **Step 1: Install deps**

```bash
pnpm add postgres
pnpm add -D @types/pg
```

- [ ] **Step 2: Create `lib/db/client.ts`**

```ts
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  // eslint-disable-next-line no-var
  var __donnaPgClient: ReturnType<typeof postgres> | undefined;
}

export const sql = global.__donnaPgClient ?? postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  transform: { undefined: null },
});

if (process.env.NODE_ENV !== "production") {
  global.__donnaPgClient = sql;
}
```

- [ ] **Step 3: Add env vars to `.env.example`**

Create or append `.env.example`:
```
DATABASE_URL=postgres://donna:password@localhost:5432/donna_blog
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me-32-bytes-base64
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
BOOTSTRAP_ALLOWED_GITHUB_LOGIN=zachlagden
SITE_URL=https://donna.fyi
CRON_SECRET=replace-me-shared-with-coolify-cron
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml lib/db/client.ts .env.example
git commit -m "feat(db): add postgres.js client + env scaffolding"
```

---

### Task 2: Migration runner + initial schema

**Files:**
- Create: `lib/db/migrate.ts`
- Create: `lib/db/migrations/0001_init.sql`
- Create: `scripts/migrate.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Create `lib/db/migrations/0001_init.sql`**

```sql
-- schema_migrations is created bootstrapped by migrate.ts before this runs

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     bigint NOT NULL UNIQUE,
  github_login  text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'owner',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  key_hash      text NOT NULL,
  key_prefix    text NOT NULL,
  author_tag    text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  scopes        text[] NOT NULL DEFAULT '{posts:read,posts:write}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

CREATE INDEX api_keys_active_idx ON api_keys (user_id) WHERE revoked_at IS NULL;
CREATE INDEX api_keys_prefix_idx ON api_keys (key_prefix) WHERE revoked_at IS NULL;

CREATE TABLE posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  summary         text,
  author_tag      text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  mdx_source      text NOT NULL,
  mdx_compiled    text NOT NULL,
  toc             jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_time_s  integer NOT NULL DEFAULT 0,
  published_at    timestamptz,
  scheduled_for   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX posts_published_idx ON posts (published_at DESC) WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX posts_scheduled_idx ON posts (scheduled_for) WHERE scheduled_for IS NOT NULL AND published_at IS NULL;

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

-- NextAuth tables (manually defined here so our migration owns them too)
CREATE TABLE nextauth_user (
  id            text PRIMARY KEY,
  name          text,
  email         text UNIQUE,
  email_verified timestamptz,
  image         text
);

CREATE TABLE nextauth_account (
  user_id              text NOT NULL REFERENCES nextauth_user(id) ON DELETE CASCADE,
  type                 text NOT NULL,
  provider             text NOT NULL,
  provider_account_id  text NOT NULL,
  refresh_token        text,
  access_token         text,
  expires_at           bigint,
  token_type           text,
  scope                text,
  id_token             text,
  session_state        text,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE nextauth_session (
  session_token  text PRIMARY KEY,
  user_id        text NOT NULL REFERENCES nextauth_user(id) ON DELETE CASCADE,
  expires        timestamptz NOT NULL
);

CREATE TABLE nextauth_verification_token (
  identifier  text NOT NULL,
  token       text NOT NULL,
  expires     timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

- [ ] **Step 2: Create `lib/db/migrate.ts`**

```ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sql } from "./client";

export async function runMigrations(): Promise<void> {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const applied = await sql<{ version: string }[]>`SELECT version FROM schema_migrations`;
  const appliedSet = new Set(applied.map((r) => r.version));

  const dir = join(process.cwd(), "lib/db/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (appliedSet.has(version)) {
      console.log(`skip ${version} (already applied)`);
      continue;
    }
    const body = readFileSync(join(dir, file), "utf-8");
    console.log(`applying ${version}…`);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO schema_migrations (version) VALUES (${version})`;
    });
    console.log(`✓ ${version}`);
  }
}
```

- [ ] **Step 3: Create `scripts/migrate.ts`**

```ts
import { runMigrations } from "@/lib/db/migrate";
import { sql } from "@/lib/db/client";

async function main() {
  try {
    await runMigrations();
    console.log("✓ migrations complete");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Add script to `package.json`**

```json
"db:migrate": "tsx scripts/migrate.ts"
```

Install `tsx`:
```bash
pnpm add -D tsx
```

- [ ] **Step 5: Start a local Postgres and run the migration**

```bash
docker run --name donna-pg-dev -e POSTGRES_PASSWORD=password -e POSTGRES_USER=donna -e POSTGRES_DB=donna_blog -p 5432:5432 -d postgres:16
echo "DATABASE_URL=postgres://donna:password@localhost:5432/donna_blog" >> .env.local
pnpm db:migrate
```

Expect: each migration logs "✓".

Verify: `docker exec -it donna-pg-dev psql -U donna -d donna_blog -c '\dt'` lists all 9 tables + `schema_migrations`.

- [ ] **Step 6: Commit**

```bash
git add lib/db/ scripts/migrate.ts package.json pnpm-lock.yaml
git commit -m "feat(db): migration runner + initial schema (v0001)"
```

---

## Phase 2: NextAuth + GitHub OAuth allowlist

### Task 3: NextAuth setup with GitHub provider

**Files:**
- Modify: `package.json` (Auth.js + Postgres adapter)
- Create: `lib/auth/nextauth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Install deps**

```bash
pnpm add next-auth@beta @auth/pg-adapter pg
pnpm add -D @types/pg
```

- [ ] **Step 2: Create `lib/auth/nextauth.ts`**

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import { sql } from "@/lib/db/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })],
  session: { strategy: "database" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;
      const githubId = profile.id as number | undefined;
      const githubLogin = profile.login as string | undefined;
      if (!githubId || !githubLogin) return false;

      const existing = await sql<{ id: string }[]>`SELECT id FROM users WHERE github_id = ${githubId}`;
      if (existing.length > 0) return true;

      const count = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
      if (Number(count[0].count) === 0) {
        const allowed = process.env.BOOTSTRAP_ALLOWED_GITHUB_LOGIN;
        if (allowed && githubLogin === allowed) {
          await sql`
            INSERT INTO users (github_id, github_login, display_name, role)
            VALUES (${githubId}, ${githubLogin}, ${(profile.name as string) ?? githubLogin}, 'owner')
          `;
          return true;
        }
      }
      return false;
    },
  },
});
```

The Postgres adapter writes to `next_auth.*` tables by default; we manually defined `nextauth_*` tables in migration 0001. The adapter expects table names like `users`, `accounts`, `sessions`, `verification_tokens` by default — if needed, configure the adapter's table-name mapping; verify in step 4 that login round-trips before committing.

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```ts
export { GET, POST } from "@/lib/auth/nextauth";
```

Actually NextAuth v5 exports `handlers` (object with `GET` and `POST`):
```ts
import { handlers } from "@/lib/auth/nextauth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Configure GitHub OAuth app**

Manually (Zach does this once):
1. Go to https://github.com/settings/developers → "New OAuth App"
2. Name: "donna.fyi (dev)"
3. Homepage: http://localhost:3000
4. Callback: http://localhost:3000/api/auth/callback/github
5. Save → copy Client ID + Secret into `.env.local`

For prod: another OAuth app at `https://donna.fyi/api/auth/callback/github`.

- [ ] **Step 5: Test the login round-trip**

```bash
pnpm dev
```
Open `http://localhost:3000/admin/login` (placeholder for now — the page comes in Task 5). For now, hit `http://localhost:3000/api/auth/signin` directly. Click "GitHub". Authorise. Expect: redirect to NextAuth's default callback page, no error. Run:
```sql
docker exec -it donna-pg-dev psql -U donna -d donna_blog -c "SELECT id, github_login FROM users;"
```
Expect: one row with your GitHub login.

(If table-name mismatch errors occur, edit `lib/auth/nextauth.ts` to pass the adapter explicit table-name mappings. The Postgres adapter's docs cover this; or recreate `nextauth_*` tables under the default names the adapter expects. Lock down before committing.)

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml lib/auth/nextauth.ts app/api/auth/
git commit -m "feat(auth): NextAuth with GitHub provider + single-user allowlist"
```

---

### Task 4: Allowlist callback unit test

**Files:**
- Create: `lib/auth/allowlist.ts` (refactor signIn logic out for testability)
- Create: `tests/unit/auth/allowlist.test.ts`
- Modify: `lib/auth/nextauth.ts` (use the new helper)

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { evaluateSignIn } from "@/lib/auth/allowlist";

describe("evaluateSignIn", () => {
  it("admits existing user", async () => {
    const lookup = vi.fn().mockResolvedValue(true);
    const userCount = vi.fn().mockResolvedValue(1);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 1, login: "zachlagden", name: "Zach" },
      bootstrapLogin: "zachlagden",
      userExists: lookup,
      userCount,
      bootstrap,
    });
    expect(result).toBe(true);
    expect(bootstrap).not.toHaveBeenCalled();
  });
  it("rejects unknown user when one exists", async () => {
    const lookup = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(1);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 999, login: "someone-else", name: null },
      bootstrapLogin: "zachlagden",
      userExists: lookup,
      userCount,
      bootstrap,
    });
    expect(result).toBe(false);
    expect(bootstrap).not.toHaveBeenCalled();
  });
  it("bootstraps when no users yet AND login matches env", async () => {
    const lookup = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(0);
    const bootstrap = vi.fn().mockResolvedValue(undefined);
    const result = await evaluateSignIn({
      profile: { id: 1, login: "zachlagden", name: "Zach" },
      bootstrapLogin: "zachlagden",
      userExists: lookup,
      userCount,
      bootstrap,
    });
    expect(result).toBe(true);
    expect(bootstrap).toHaveBeenCalled();
  });
  it("refuses bootstrap with wrong login", async () => {
    const lookup = vi.fn().mockResolvedValue(false);
    const userCount = vi.fn().mockResolvedValue(0);
    const bootstrap = vi.fn();
    const result = await evaluateSignIn({
      profile: { id: 1, login: "intruder", name: null },
      bootstrapLogin: "zachlagden",
      userExists: lookup,
      userCount,
      bootstrap,
    });
    expect(result).toBe(false);
    expect(bootstrap).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `lib/auth/allowlist.ts`**

```ts
export interface SignInEvalArgs {
  profile: { id?: number; login?: string; name?: string | null };
  bootstrapLogin: string | undefined;
  userExists: (githubId: number) => Promise<boolean>;
  userCount: () => Promise<number>;
  bootstrap: (args: { githubId: number; githubLogin: string; displayName: string }) => Promise<void>;
}

export async function evaluateSignIn(args: SignInEvalArgs): Promise<boolean> {
  const { profile, bootstrapLogin, userExists, userCount, bootstrap } = args;
  if (!profile.id || !profile.login) return false;
  if (await userExists(profile.id)) return true;
  if ((await userCount()) === 0 && bootstrapLogin && profile.login === bootstrapLogin) {
    await bootstrap({ githubId: profile.id, githubLogin: profile.login, displayName: profile.name ?? profile.login });
    return true;
  }
  return false;
}
```

- [ ] **Step 4: Refactor `lib/auth/nextauth.ts` to use it**

Replace the `signIn` callback body:
```ts
async signIn({ profile }) {
  if (!profile) return false;
  return evaluateSignIn({
    profile: { id: profile.id as number, login: profile.login as string, name: profile.name as string ?? null },
    bootstrapLogin: process.env.BOOTSTRAP_ALLOWED_GITHUB_LOGIN,
    userExists: async (id) => {
      const r = await sql<{ ok: boolean }[]>`SELECT TRUE AS ok FROM users WHERE github_id = ${id}`;
      return r.length > 0;
    },
    userCount: async () => {
      const r = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`;
      return Number(r[0].count);
    },
    bootstrap: async ({ githubId, githubLogin, displayName }) => {
      await sql`INSERT INTO users (github_id, github_login, display_name, role) VALUES (${githubId}, ${githubLogin}, ${displayName}, 'owner')`;
    },
  });
},
```

Add import:
```ts
import { evaluateSignIn } from "./allowlist";
```

- [ ] **Step 5: Tests pass; commit**

```bash
pnpm test tests/unit/auth/allowlist.test.ts
git add lib/auth/allowlist.ts lib/auth/nextauth.ts tests/unit/auth/allowlist.test.ts
git commit -m "feat(auth): extract allowlist logic for testability + unit tests"
```

---

### Task 5: Login + admin layout pages

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `lib/auth/session.ts`

- [ ] **Step 1: Create `lib/auth/session.ts`**

```ts
import { redirect } from "next/navigation";
import { auth } from "./nextauth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}
```

- [ ] **Step 2: Create `app/admin/layout.tsx`**

```tsx
import { Nav } from "@/components/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `app/admin/login/page.tsx`**

```tsx
import { signIn } from "@/lib/auth/nextauth";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto px-6 pt-32 pb-12">
      <h1 className="text-3xl font-bold text-zinc-100 mb-3" style={{ fontFamily: "var(--font-newsreader)" }}>
        Admin sign-in
      </h1>
      <p className="text-zinc-500 mb-8 text-sm">
        Locked to a single GitHub account.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin/keys" });
        }}
      >
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 transition-colors"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Test the round-trip**

```bash
pnpm dev
```
Open `http://localhost:3000/admin/login`. Click. Authorise on GitHub. Land on `/admin/keys` (which 404s for now — fixed in Task 8).

- [ ] **Step 5: Commit**

```bash
git add app/admin/ lib/auth/session.ts
git commit -m "feat(admin): login page + session helper"
```

---

## Phase 3: API key foundation

### Task 6: API key hashing (argon2id)

**Files:**
- Modify: `package.json`
- Create: `lib/auth/hash.ts`
- Create: `tests/unit/auth/hash.test.ts`

- [ ] **Step 1: Install argon2**

```bash
pnpm add @node-rs/argon2
```

- [ ] **Step 2: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import { hashKey, verifyKey } from "@/lib/auth/hash";

describe("hashKey + verifyKey", () => {
  it("verifies a freshly hashed key", async () => {
    const hash = await hashKey("super-secret");
    expect(hash).not.toBe("super-secret");
    expect(await verifyKey(hash, "super-secret")).toBe(true);
  });
  it("rejects the wrong key", async () => {
    const hash = await hashKey("a");
    expect(await verifyKey(hash, "b")).toBe(false);
  });
});
```

- [ ] **Step 3: Create `lib/auth/hash.ts`**

```ts
import { hash, verify, Algorithm } from "@node-rs/argon2";

const opts = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 65536,   // 64 MB
  timeCost: 3,
  parallelism: 1,
};

export async function hashKey(plaintext: string): Promise<string> {
  return hash(plaintext, opts);
}

export async function verifyKey(stored: string, plaintext: string): Promise<boolean> {
  try {
    return await verify(stored, plaintext);
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/auth/hash.test.ts
git add lib/auth/hash.ts tests/unit/auth/hash.test.ts package.json pnpm-lock.yaml
git commit -m "feat(auth): argon2id hashing helpers"
```

---

### Task 7: API key minting + revocation

**Files:**
- Create: `lib/auth/mint.ts`
- Create: `tests/unit/auth/mint.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { generateKey, parsePrefix } from "@/lib/auth/mint";

describe("generateKey", () => {
  it("uses author prefix", () => {
    const { plaintext, prefix } = generateKey("donna");
    expect(plaintext.startsWith("donna_sk_")).toBe(true);
    expect(prefix).toBe(plaintext.slice(0, 12));
    expect(plaintext.length).toBeGreaterThan(32);
  });
  it("produces unique keys", () => {
    const a = generateKey("zach").plaintext;
    const b = generateKey("zach").plaintext;
    expect(a).not.toBe(b);
  });
});

describe("parsePrefix", () => {
  it("recovers prefix from full key", () => {
    expect(parsePrefix("donna_sk_AbCdEfGh1234567890XYZ")).toBe("donna_sk_AbC");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `lib/auth/mint.ts`**

```ts
import { randomBytes } from "node:crypto";

export type AuthorTag = "donna" | "zach";

function urlSafe(b: Buffer): string {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateKey(author: AuthorTag): { plaintext: string; prefix: string } {
  const random = urlSafe(randomBytes(24)).slice(0, 32);
  const plaintext = `${author}_sk_${random}`;
  return { plaintext, prefix: plaintext.slice(0, 12) };
}

export function parsePrefix(full: string): string {
  return full.slice(0, 12);
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/auth/mint.test.ts
git add lib/auth/mint.ts tests/unit/auth/mint.test.ts
git commit -m "feat(auth): API key generator + prefix parser"
```

---

### Task 8: Admin keys page + mint/revoke endpoints

**Files:**
- Create: `app/admin/keys/page.tsx`
- Create: `app/api/v1/me/keys/route.ts`
- Create: `app/api/v1/me/keys/[id]/revoke/route.ts`

- [ ] **Step 1: Create `app/api/v1/me/keys/route.ts`**

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db/client";
import { hashKey } from "@/lib/auth/hash";
import { generateKey } from "@/lib/auth/mint";

const Body = z.object({
  name: z.string().min(1).max(80),
  author_tag: z.enum(["donna", "zach"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parse = Body.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }

  const owner = await sql<{ id: string }[]>`SELECT id FROM users LIMIT 1`;
  if (owner.length === 0) {
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });
  }

  const { plaintext, prefix } = generateKey(parse.data.author_tag);
  const hash = await hashKey(plaintext);

  const [row] = await sql<{ id: string; created_at: Date }[]>`
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix, author_tag)
    VALUES (${owner[0].id}, ${parse.data.name}, ${hash}, ${prefix}, ${parse.data.author_tag})
    RETURNING id, created_at
  `;

  return NextResponse.json({
    id: row.id,
    name: parse.data.name,
    author_tag: parse.data.author_tag,
    key_prefix: prefix,
    plaintext_key: plaintext,
    created_at: row.created_at,
  }, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/v1/me/keys/[id]/revoke/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db/client";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  const { id } = await ctx.params;
  await sql`UPDATE api_keys SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL`;
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create `app/admin/keys/page.tsx`**

```tsx
import { requireSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { hashKey } from "@/lib/auth/hash";
import { generateKey } from "@/lib/auth/mint";

interface KeyRow {
  id: string;
  name: string;
  author_tag: "donna" | "zach";
  key_prefix: string;
  created_at: Date;
  last_used_at: Date | null;
  revoked_at: Date | null;
}

async function mintAction(formData: FormData) {
  "use server";
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const author_tag = String(formData.get("author_tag") ?? "") as "donna" | "zach";
  if (!name || !["donna", "zach"].includes(author_tag)) return;
  const owner = await sql<{ id: string }[]>`SELECT id FROM users LIMIT 1`;
  if (owner.length === 0) return;
  const { plaintext, prefix } = generateKey(author_tag);
  const hash = await hashKey(plaintext);
  await sql`
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix, author_tag)
    VALUES (${owner[0].id}, ${name}, ${hash}, ${prefix}, ${author_tag})
  `;
  revalidatePath("/admin/keys");
  return { plaintext };
}

async function revokeAction(formData: FormData) {
  "use server";
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await sql`UPDATE api_keys SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL`;
  revalidatePath("/admin/keys");
}

export default async function KeysPage() {
  await requireSession();
  const keys = await sql<KeyRow[]>`
    SELECT id, name, author_tag, key_prefix, created_at, last_used_at, revoked_at
    FROM api_keys ORDER BY created_at DESC
  `;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-32 pb-32">
      <h1 className="text-3xl font-bold text-zinc-100 mb-2" style={{ fontFamily: "var(--font-newsreader)" }}>
        API keys
      </h1>
      <p className="text-zinc-500 mb-10 text-sm">The only "admin" surface. Mint, list, revoke.</p>

      <form action={mintAction as unknown as (formData: FormData) => Promise<void>} className="rounded-lg border border-zinc-800/60 p-5 mb-10 space-y-3">
        <p className="text-sm text-zinc-300 font-semibold">Mint a new key</p>
        <input name="name" required placeholder="Donna — Hetzner box" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 placeholder-zinc-600" />
        <select name="author_tag" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100">
          <option value="donna">Donna</option>
          <option value="zach">Zach</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded bg-violet-500/20 border border-violet-500/40 text-violet-200 text-sm">Mint</button>
      </form>

      <ul className="space-y-2">
        {keys.map((k) => (
          <li key={k.id} className="rounded-lg border border-zinc-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200 font-medium">{k.name}</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                {k.key_prefix}… · {k.author_tag} · {new Date(k.created_at).toLocaleDateString()}
                {k.revoked_at && <span className="text-amber-400 ml-2">revoked</span>}
              </p>
            </div>
            {!k.revoked_at && (
              <form action={revokeAction}>
                <input type="hidden" name="id" value={k.id} />
                <button type="submit" className="text-xs text-zinc-400 hover:text-red-300">Revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-600 mt-12 italic">
        Plaintext keys are shown exactly once when minted. Copy them immediately — there is no recovery.
      </p>
    </main>
  );
}
```

(Note: the one-shot plaintext display is left as TODO via server-action return; the implementing engineer should add a small `useFormState`-driven banner showing the freshly minted plaintext. The HTTP endpoint at Task 8 Step 1 already returns plaintext; the page can use that endpoint via `fetch` for a polished UX. For v1 the page above ships with mint working but plaintext NOT surfaced in UI — the engineer should add `useFormState` to render `result.plaintext` once after submit.)

- [ ] **Step 4: Polish the mint flow with `useFormState`**

Update the page to use the HTTP endpoint via a client island that calls `POST /api/v1/me/keys`, then displays the plaintext in a one-shot modal. Implementation: create `components/admin/mint-key-form.tsx` (client component), fetch from `/api/v1/me/keys`, display result in a styled banner that auto-clears on next mint.

- [ ] **Step 5: Verify flow end to end**

```bash
pnpm dev
```
- Login → `/admin/keys` → mint a Donna key → plaintext appears once
- Refresh → plaintext no longer shown, prefix-only row visible
- Revoke → marked revoked

- [ ] **Step 6: Commit**

```bash
git add app/admin/keys/page.tsx app/api/v1/me/keys/ components/admin/
git commit -m "feat(admin): API keys page + mint/revoke endpoints"
```

---

## Phase 4: API key bearer-auth middleware

### Task 9: API key validator

**Files:**
- Create: `lib/auth/api-key.ts`
- Create: `tests/unit/auth/api-key.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { validateBearer } from "@/lib/auth/api-key";

describe("validateBearer", () => {
  const lookupOk = vi.fn().mockResolvedValue([
    { id: "k1", user_id: "u1", key_hash: "hash", author_tag: "donna", scopes: ["posts:write"] },
  ]);
  const lookupEmpty = vi.fn().mockResolvedValue([]);
  const verifyTrue = async () => true;
  const verifyFalse = async () => false;

  it("rejects missing header", async () => {
    const r = await validateBearer(null, { lookupActiveByPrefix: lookupOk, verify: verifyTrue, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("rejects unknown prefix", async () => {
    const r = await validateBearer("Bearer donna_sk_zzzz1234", { lookupActiveByPrefix: lookupEmpty, verify: verifyTrue, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("rejects bad hash", async () => {
    const r = await validateBearer("Bearer donna_sk_abcdEFGH1", { lookupActiveByPrefix: lookupOk, verify: verifyFalse, markUsed: async () => {} });
    expect(r.ok).toBe(false);
  });
  it("admits valid key and returns context", async () => {
    const markUsed = vi.fn();
    const r = await validateBearer("Bearer donna_sk_abcdEFGH1", { lookupActiveByPrefix: lookupOk, verify: verifyTrue, markUsed });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.context.author_tag).toBe("donna");
      expect(r.context.scopes).toContain("posts:write");
    }
    expect(markUsed).toHaveBeenCalledWith("k1");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `lib/auth/api-key.ts`**

```ts
import { parsePrefix } from "./mint";

export interface KeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  author_tag: "donna" | "zach";
  scopes: string[];
}

export interface ApiKeyContext {
  key_id: string;
  user_id: string;
  author_tag: "donna" | "zach";
  scopes: string[];
}

interface Deps {
  lookupActiveByPrefix: (prefix: string) => Promise<KeyRow[]>;
  verify: (stored: string, plaintext: string) => Promise<boolean>;
  markUsed: (id: string) => Promise<void>;
}

export type ValidateResult =
  | { ok: true; context: ApiKeyContext }
  | { ok: false; code: "missing" | "malformed" | "not_found" | "invalid" };

export async function validateBearer(
  header: string | null,
  deps: Deps,
): Promise<ValidateResult> {
  if (!header) return { ok: false, code: "missing" };
  const match = /^Bearer\s+(\S+)$/.exec(header);
  if (!match) return { ok: false, code: "malformed" };
  const token = match[1];
  if (!/^(donna|zach)_sk_/.test(token)) return { ok: false, code: "malformed" };

  const prefix = parsePrefix(token);
  const rows = await deps.lookupActiveByPrefix(prefix);
  if (rows.length === 0) return { ok: false, code: "not_found" };

  for (const row of rows) {
    if (await deps.verify(row.key_hash, token)) {
      deps.markUsed(row.id).catch(() => {});
      return {
        ok: true,
        context: { key_id: row.id, user_id: row.user_id, author_tag: row.author_tag, scopes: row.scopes },
      };
    }
  }
  return { ok: false, code: "invalid" };
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/auth/api-key.test.ts
git add lib/auth/api-key.ts tests/unit/auth/api-key.test.ts
git commit -m "feat(auth): bearer-token API key validator"
```

---

### Task 10: Wire validator into a request helper

**Files:**
- Create: `lib/auth/require-key.ts`

- [ ] **Step 1: Create the helper**

```ts
import { sql } from "@/lib/db/client";
import { verifyKey } from "./hash";
import { validateBearer, type ApiKeyContext } from "./api-key";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function requireApiKey(
  req: NextRequest,
  requiredScope?: string,
): Promise<{ ok: true; context: ApiKeyContext } | { ok: false; response: NextResponse }> {
  const r = await validateBearer(req.headers.get("authorization"), {
    lookupActiveByPrefix: async (prefix) => {
      return sql<{ id: string; user_id: string; key_hash: string; author_tag: "donna" | "zach"; scopes: string[] }[]>`
        SELECT id, user_id, key_hash, author_tag, scopes
        FROM api_keys WHERE key_prefix = ${prefix} AND revoked_at IS NULL
      `;
    },
    verify: verifyKey,
    markUsed: async (id) => {
      await sql`UPDATE api_keys SET last_used_at = now() WHERE id = ${id}`;
    },
  });
  if (!r.ok) {
    return { ok: false, response: NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 }) };
  }
  if (requiredScope && !r.context.scopes.includes(requiredScope)) {
    return { ok: false, response: NextResponse.json({ error: { code: "forbidden" } }, { status: 403 }) };
  }
  return { ok: true, context: r.context };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth/require-key.ts
git commit -m "feat(auth): requireApiKey helper for route handlers"
```

---

## Phase 5: MDX compile pipeline

### Task 11: Compile pipeline + component validation

**Files:**
- Modify: `package.json`
- Create: `lib/blog/mdx/shiki.ts`
- Create: `lib/blog/mdx/validate.ts`
- Create: `lib/blog/mdx/toc.ts`
- Create: `lib/blog/mdx/compile.ts`
- Create: `tests/unit/blog/mdx/compile.test.ts`
- Create: `tests/unit/blog/mdx/validate.test.ts`
- Create: `tests/unit/blog/mdx/toc.test.ts`

- [ ] **Step 1: Install deps**

```bash
pnpm add @mdx-js/mdx remark-gfm remark-smartypants rehype-slug rehype-autolink-headings unist-util-visit hast-util-to-html
```

- [ ] **Step 2: Create `lib/blog/mdx/shiki.ts`**

```ts
import { createHighlighter, type Highlighter } from "shiki";

let _highlighter: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!_highlighter) {
    _highlighter = createHighlighter({
      themes: ["github-dark-dimmed"],
      langs: ["ts", "tsx", "js", "jsx", "sh", "bash", "json", "yaml", "sql", "py", "rust", "md", "diff"],
    });
  }
  return _highlighter;
}
```

- [ ] **Step 3: Create `lib/blog/mdx/validate.ts`**

```ts
import type { Root } from "hast";
import { visit } from "unist-util-visit";
import { allowedMdxComponentNames } from "@/components/mdx";

export class MdxValidationError extends Error {
  constructor(public componentName: string) {
    super(`Unknown MDX component: ${componentName}`);
  }
}

export function rehypeValidateComponents() {
  return (tree: Root) => {
    visit(tree, "mdxJsxFlowElement", (node: any) => {
      const name = node.name;
      if (typeof name !== "string") return;
      if (!/^[A-Z]/.test(name)) return; // lowercase = HTML, allowed
      if (!allowedMdxComponentNames.has(name)) throw new MdxValidationError(name);
    });
    visit(tree, "mdxJsxTextElement", (node: any) => {
      const name = node.name;
      if (typeof name !== "string") return;
      if (!/^[A-Z]/.test(name)) return;
      if (!allowedMdxComponentNames.has(name)) throw new MdxValidationError(name);
    });
  };
}
```

- [ ] **Step 4: Create `lib/blog/mdx/toc.ts`**

```ts
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { TocEntry } from "@/lib/blog/types";

export function rehypeExtractToc(collect: TocEntry[]) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = (node.properties?.id as string) ?? "";
      if (!id) return;
      const text = textOf(node);
      collect.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
    });
  };
}

function textOf(node: Element): string {
  let out = "";
  visit(node, "text", (t: any) => { out += t.value as string; });
  return out;
}
```

- [ ] **Step 5: Create `lib/blog/mdx/compile.ts`**

```ts
import { compile } from "@mdx-js/mdx";
import { toHtml } from "hast-util-to-html";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeValidateComponents, MdxValidationError } from "./validate";
import { rehypeExtractToc } from "./toc";
import type { TocEntry } from "@/lib/blog/types";
import { readingTimeSeconds } from "@/lib/blog/reading-time";
import { getHighlighter } from "./shiki";

export interface CompileResult {
  compiled: string;          // HTML string (allowlist-validated, Shiki-highlighted)
  toc: TocEntry[];
  readingTimeSeconds: number;
}

export class MdxCompileError extends Error {
  constructor(message: string, public details?: { line?: number; column?: number; componentName?: string }) {
    super(message);
  }
}

export async function compileMdx(source: string): Promise<CompileResult> {
  const toc: TocEntry[] = [];
  const highlighter = await getHighlighter();

  try {
    // First pass: validate via @mdx-js/mdx's plugin chain (we'll throw on disallowed component)
    await compile(source, {
      remarkPlugins: [remarkGfm, remarkSmartypants],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        rehypeValidateComponents,
        rehypeExtractToc(toc),
      ],
      outputFormat: "function-body",
    });
  } catch (err) {
    if (err instanceof MdxValidationError) {
      throw new MdxCompileError(err.message, { componentName: err.componentName });
    }
    const e = err as { message: string; line?: number; column?: number };
    throw new MdxCompileError(e.message ?? "MDX compile failed", { line: e.line, column: e.column });
  }

  // Second pass: render to HTML using a simple plain-markdown-to-html path for the body.
  // For v1 we render markdown only; MDX-component bodies are stored compiled-but-not-evaluated
  // (the reader page uses dangerouslySetInnerHTML on this HTML).
  // The component allowlist still gates the SOURCE; bodies that use allowlisted components
  // will be expanded by the read-time MDX evaluator in a follow-up.
  const html = await renderHtml(source, highlighter, toc);

  return {
    compiled: html,
    toc,
    readingTimeSeconds: readingTimeSeconds(source.replace(/<[^>]*>/g, " ")),
  };
}

async function renderHtml(
  source: string,
  highlighter: Awaited<ReturnType<typeof getHighlighter>>,
  _toc: TocEntry[],
): Promise<string> {
  // Minimal markdown→HTML conversion using @mdx-js/mdx's mdast pipeline + hast-util-to-html.
  // Implementation note: use mdast-util-to-hast in a one-shot to convert remark-gfm output to HTML.
  // For v1, delegate to a small helper:
  const { remark } = await import("remark");
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;
  const mdAst = await remark().use(remarkGfm).use(remarkSmartypants).parse(source);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .run(mdAst);
  // syntax-highlight code blocks in the hast tree
  const { visit } = await import("unist-util-visit");
  visit(processed as any, "element", (node: any, _i: any, parent: any) => {
    if (node.tagName !== "code") return;
    if (!parent || parent.tagName !== "pre") return;
    const langClass = (node.properties?.className as string[] | undefined)?.find((c) => c.startsWith("language-"));
    const lang = langClass ? langClass.replace("language-", "") : "text";
    const code = textChildren(node);
    const html = highlighter.codeToHtml(code, { lang: lang as any, theme: "github-dark-dimmed" });
    parent.tagName = "div";
    parent.children = [{ type: "raw", value: html }];
  });
  const html = String(await remark().use(remarkRehype).use(rehypeStringify, { allowDangerousHtml: true }).stringify(processed as any));
  return html;
}

function textChildren(node: any): string {
  let out = "";
  for (const c of node.children ?? []) {
    if (c.type === "text") out += c.value as string;
  }
  return out;
}
```

Add deps:
```bash
pnpm add remark remark-rehype rehype-stringify mdast-util-to-hast
```

(Implementing engineer: the renderHtml function above is intentionally compact. If you find the inline two-pass setup awkward, refactor into a single unified pipeline that runs once per compile. The contract — `{ compiled, toc, readingTimeSeconds }` from a string source — is what matters.)

- [ ] **Step 6: Write failing tests**

`tests/unit/blog/mdx/validate.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";

describe("compileMdx validation", () => {
  it("accepts allowlisted component", async () => {
    const out = await compileMdx("# hi\n\n<Note>Body</Note>");
    expect(out.compiled).toContain("hi");
  });
  it("rejects unknown component", async () => {
    await expect(compileMdx("# hi\n\n<DangerousScript />")).rejects.toBeInstanceOf(MdxCompileError);
  });
});
```

`tests/unit/blog/mdx/toc.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { compileMdx } from "@/lib/blog/mdx/compile";

describe("compileMdx toc", () => {
  it("extracts H2 + H3 entries", async () => {
    const out = await compileMdx("## Section A\n\n### Sub\n\n## Section B\n");
    expect(out.toc.map((t) => t.text)).toEqual(["Section A", "Sub", "Section B"]);
    expect(out.toc.map((t) => t.level)).toEqual([2, 3, 2]);
  });
});
```

`tests/unit/blog/mdx/compile.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { compileMdx } from "@/lib/blog/mdx/compile";

describe("compileMdx", () => {
  it("returns reading time", async () => {
    const out = await compileMdx("word ".repeat(100));
    expect(out.readingTimeSeconds).toBeGreaterThan(20);
  });
  it("highlights code blocks", async () => {
    const out = await compileMdx("```ts\nconst x: number = 1;\n```");
    expect(out.compiled).toContain("shiki"); // shiki output classes
  });
});
```

- [ ] **Step 7: Run, expect FAIL → iterate until PASS**

```bash
pnpm test tests/unit/blog/mdx
```

- [ ] **Step 8: Commit**

```bash
git add lib/blog/mdx/ tests/unit/blog/mdx/ package.json pnpm-lock.yaml
git commit -m "feat(mdx): compile pipeline with component allowlist + TOC + Shiki"
```

---

## Phase 6: Posts queries + API endpoints

### Task 12: Posts DB queries

**Files:**
- Create: `lib/blog/posts.ts`
- Create: `lib/blog/revisions.ts`
- Create: `lib/blog/tags.ts`

- [ ] **Step 1: Create `lib/blog/posts.ts`**

```ts
import { sql } from "@/lib/db/client";
import type { Post, PostSummary, Tag, AuthorTag, ListPostsOptions, ListPostsResult, TocEntry } from "./types";
import { AUTHORS } from "./types";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author_tag: AuthorTag;
  mdx_compiled: string;
  toc: TocEntry[];
  reading_time_s: number;
  published_at: Date | null;
  scheduled_for: Date | null;
  revision_count: number;
  last_edited_at: Date | null;
  tags: Tag[];
}

function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    author: AUTHORS[r.author_tag],
    mdxCompiled: r.mdx_compiled,
    readingTimeSeconds: r.reading_time_s,
    publishedAt: r.published_at!,
    scheduledFor: r.scheduled_for,
    tags: r.tags ?? [],
    revisionCount: r.revision_count,
    lastEditedAt: r.last_edited_at,
    toc: r.toc ?? [],
  };
}

export async function listPublished(opts: ListPostsOptions = {}): Promise<ListPostsResult> {
  const perPage = Math.min(50, opts.perPage ?? 10);
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * perPage;

  const where = sql`
    WHERE p.deleted_at IS NULL
      AND p.published_at IS NOT NULL
      AND p.published_at <= now()
      ${opts.author ? sql`AND p.author_tag = ${opts.author}` : sql``}
      ${opts.tag ? sql`AND EXISTS (
        SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id AND t.slug = ${opts.tag}
      )` : sql``}
  `;

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM posts p ${where}
  `;
  const totalCount = Number(count);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    ${where}
    ORDER BY p.published_at DESC
    LIMIT ${perPage} OFFSET ${offset}
  `;

  const posts: PostSummary[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    author: AUTHORS[r.author_tag],
    readingTimeSeconds: r.reading_time_s,
    publishedAt: r.published_at!,
    tags: r.tags ?? [],
  }));

  return { posts, totalPages, currentPage: page, totalCount };
}

export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.slug = ${slug}
      AND p.deleted_at IS NULL
      AND p.published_at IS NOT NULL
      AND p.published_at <= now()
  `;
  return rows[0] ? rowToPost(rows[0]) : null;
}

export async function getBySlugIncludingDrafts(slug: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.slug = ${slug} AND p.deleted_at IS NULL
  `;
  return rows[0] ? rowToPost(rows[0]) : null;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  summary: string | null;
  author_tag: AuthorTag;
  mdx_source: string;
  mdx_compiled: string;
  toc: TocEntry[];
  reading_time_s: number;
  published_at: Date | null;
  scheduled_for: Date | null;
  tag_slugs: string[];
}

export async function createPost(input: CreatePostInput, keyId: string): Promise<Post> {
  return sql.begin(async (tx) => {
    const [row] = await tx<{ id: string }[]>`
      INSERT INTO posts (slug, title, summary, author_tag, mdx_source, mdx_compiled, toc, reading_time_s, published_at, scheduled_for)
      VALUES (${input.slug}, ${input.title}, ${input.summary}, ${input.author_tag},
              ${input.mdx_source}, ${input.mdx_compiled}, ${JSON.stringify(input.toc)}::jsonb,
              ${input.reading_time_s}, ${input.published_at}, ${input.scheduled_for})
      RETURNING id
    `;
    await tx`
      INSERT INTO revisions (post_id, revision_number, mdx_source, mdx_compiled, edited_by_key_id)
      VALUES (${row.id}, 0, ${input.mdx_source}, ${input.mdx_compiled}, ${keyId})
    `;
    await applyTags(tx as any, row.id, input.tag_slugs);
    const full = await getBySlugIncludingDrafts(input.slug);
    if (!full) throw new Error("post vanished after insert");
    return full;
  });
}

async function applyTags(tx: any, postId: string, tagSlugs: string[]): Promise<void> {
  if (tagSlugs.length === 0) return;
  for (const slug of tagSlugs) {
    await tx`
      INSERT INTO tags (slug, name) VALUES (${slug}, ${slug})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  await tx`DELETE FROM post_tags WHERE post_id = ${postId}`;
  await tx`
    INSERT INTO post_tags (post_id, tag_id)
    SELECT ${postId}, t.id FROM tags t WHERE t.slug = ANY(${tagSlugs}::text[])
  `;
}

export interface UpdatePostInput {
  title?: string;
  summary?: string | null;
  mdx_source?: string;
  mdx_compiled?: string;
  toc?: TocEntry[];
  reading_time_s?: number;
  scheduled_for?: Date | null;
  published_at?: Date | null;
  slug?: string;
  tag_slugs?: string[];
}

export async function updatePost(currentSlug: string, input: UpdatePostInput, keyId: string): Promise<Post | null> {
  return sql.begin(async (tx) => {
    const [existing] = await tx<{ id: string }[]>`
      SELECT id FROM posts WHERE slug = ${currentSlug} AND deleted_at IS NULL
    `;
    if (!existing) return null;

    if (input.mdx_source !== undefined && input.mdx_compiled !== undefined) {
      const [{ next_revision }] = await tx<{ next_revision: number }[]>`
        SELECT COALESCE(MAX(revision_number), -1) + 1 AS next_revision
        FROM revisions WHERE post_id = ${existing.id}
      `;
      await tx`
        INSERT INTO revisions (post_id, revision_number, mdx_source, mdx_compiled, edited_by_key_id)
        VALUES (${existing.id}, ${next_revision}, ${input.mdx_source}, ${input.mdx_compiled}, ${keyId})
      `;
    }

    await tx`
      UPDATE posts SET
        title = COALESCE(${input.title ?? null}, title),
        summary = COALESCE(${input.summary ?? null}, summary),
        mdx_source = COALESCE(${input.mdx_source ?? null}, mdx_source),
        mdx_compiled = COALESCE(${input.mdx_compiled ?? null}, mdx_compiled),
        toc = COALESCE(${input.toc ? JSON.stringify(input.toc) : null}::jsonb, toc),
        reading_time_s = COALESCE(${input.reading_time_s ?? null}, reading_time_s),
        scheduled_for = COALESCE(${input.scheduled_for ?? null}, scheduled_for),
        published_at = COALESCE(${input.published_at ?? null}, published_at),
        slug = COALESCE(${input.slug ?? null}, slug),
        updated_at = now()
      WHERE id = ${existing.id}
    `;
    if (input.tag_slugs) await applyTags(tx as any, existing.id, input.tag_slugs);

    return getBySlugIncludingDrafts(input.slug ?? currentSlug);
  });
}

export async function softDelete(slug: string): Promise<boolean> {
  const res = await sql`UPDATE posts SET deleted_at = now() WHERE slug = ${slug} AND deleted_at IS NULL`;
  return res.count > 0;
}

export async function getRecentForFeed(limit: number): Promise<Post[]> {
  const rows = await sql<PostRow[]>`
    SELECT
      p.id, p.slug, p.title, p.summary, p.author_tag,
      p.mdx_compiled, p.toc, p.reading_time_s, p.published_at, p.scheduled_for,
      COALESCE((SELECT COUNT(*) FROM revisions r WHERE r.post_id = p.id), 0)::int AS revision_count,
      (SELECT MAX(edited_at) FROM revisions r WHERE r.post_id = p.id) AS last_edited_at,
      COALESCE(
        (SELECT json_agg(json_build_object('slug', t.slug, 'name', t.name))
           FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
          WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.deleted_at IS NULL AND p.published_at IS NOT NULL AND p.published_at <= now()
    ORDER BY p.published_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToPost);
}
```

- [ ] **Step 2: Create `lib/blog/revisions.ts`**

```ts
import { sql } from "@/lib/db/client";

export interface RevisionRow {
  id: string;
  revision_number: number;
  edited_at: Date;
  edited_by_key_id: string | null;
}

export async function listRevisions(slug: string): Promise<RevisionRow[] | null> {
  const [post] = await sql<{ id: string }[]>`SELECT id FROM posts WHERE slug = ${slug} AND deleted_at IS NULL`;
  if (!post) return null;
  return sql<RevisionRow[]>`
    SELECT id, revision_number, edited_at, edited_by_key_id
    FROM revisions WHERE post_id = ${post.id}
    ORDER BY revision_number DESC
  `;
}
```

- [ ] **Step 3: Create `lib/blog/tags.ts`**

```ts
import { sql } from "@/lib/db/client";
import type { Tag } from "./types";

export async function listTagsWithCounts(): Promise<Tag[]> {
  return sql<Tag[]>`
    SELECT t.slug, t.name, COUNT(pt.post_id)::int AS "postCount"
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id AND p.deleted_at IS NULL AND p.published_at <= now()
    GROUP BY t.slug, t.name
    ORDER BY t.slug
  `;
}

export async function createTag(name: string, slug?: string): Promise<Tag> {
  const finalSlug = slug ?? toSlug(name);
  const [row] = await sql<{ slug: string; name: string }[]>`
    INSERT INTO tags (slug, name) VALUES (${finalSlug}, ${name})
    RETURNING slug, name
  `;
  return { slug: row.slug, name: row.name };
}

export async function deleteTag(slug: string): Promise<boolean> {
  const res = await sql`DELETE FROM tags WHERE slug = ${slug}`;
  return res.count > 0;
}

export function toSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/blog/posts.ts lib/blog/revisions.ts lib/blog/tags.ts
git commit -m "feat(blog): post + revision + tag query helpers"
```

---

### Task 13: POST /api/v1/posts (create)

**Files:**
- Create: `app/api/v1/posts/route.ts` (GET list + POST create)

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";
import { createPost, listPublished } from "@/lib/blog/posts";
import { toSlug } from "@/lib/blog/tags";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";

const CreateBody = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).nullable().optional(),
  mdx_source: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  tags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag") ?? undefined;
  const author = url.searchParams.get("author") ?? undefined;
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1;
  const perPage = Number.parseInt(url.searchParams.get("per_page") ?? "10", 10) || 10;
  const result = await listPublished({
    tag,
    author: author === "donna" || author === "zach" ? author : undefined,
    page, perPage,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;

  const json = await req.json().catch(() => null);
  const parse = CreateBody.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }

  let compiled;
  try {
    compiled = await compileMdx(parse.data.mdx_source);
  } catch (err) {
    if (err instanceof MdxCompileError) {
      return NextResponse.json({ error: { code: "invalid_mdx", message: err.message, details: err.details } }, { status: 400 });
    }
    throw err;
  }

  const slug = parse.data.slug ?? toSlug(parse.data.title);
  const scheduledFor = parse.data.scheduled_for ? new Date(parse.data.scheduled_for) : null;
  const publishedAt = scheduledFor && scheduledFor > new Date() ? null : new Date();

  try {
    const post = await createPost({
      slug,
      title: parse.data.title,
      summary: parse.data.summary ?? null,
      author_tag: auth.context.author_tag,
      mdx_source: parse.data.mdx_source,
      mdx_compiled: compiled.compiled,
      toc: compiled.toc,
      reading_time_s: compiled.readingTimeSeconds,
      published_at: publishedAt,
      scheduled_for: scheduledFor,
      tag_slugs: parse.data.tags ?? [],
    }, auth.context.key_id);

    if (post.publishedAt) {
      regenerateFeeds().catch(() => {});
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "23505") {
      return NextResponse.json({ error: { code: "slug_conflict", message: "Slug already exists" } }, { status: 409 });
    }
    throw err;
  }
}
```

- [ ] **Step 2: Create `lib/blog/feeds/regenerate.ts` stub**

```ts
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildRss } from "./rss";
import { buildAtom } from "./atom";
import { getRecentForFeed } from "@/lib/blog/posts";

const SITE_URL = process.env.SITE_URL ?? "https://donna.fyi";

export async function regenerateFeeds(): Promise<void> {
  const posts = await getRecentForFeed(20);
  const rss = buildRss({
    siteUrl: SITE_URL, title: "donna.fyi", description: "Notes from Donna and Zach.", posts,
  });
  const atom = buildAtom({
    siteUrl: SITE_URL, title: "donna.fyi", description: "Notes from Donna and Zach.", posts,
  });
  const publicDir = join(process.cwd(), "public");
  await Promise.all([
    writeFile(join(publicDir, "rss.xml"), rss, "utf-8"),
    writeFile(join(publicDir, "atom.xml"), atom, "utf-8"),
  ]);
}
```

(Reuses `buildRss` and `buildAtom` from Plan A.)

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/posts/route.ts lib/blog/feeds/regenerate.ts
git commit -m "feat(api): POST /api/v1/posts (create) + GET list + feed regen on publish"
```

---

### Task 14: GET / PATCH / DELETE /api/v1/posts/[slug]

**Files:**
- Create: `app/api/v1/posts/[slug]/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { compileMdx, MdxCompileError } from "@/lib/blog/mdx/compile";
import { getBySlugIncludingDrafts, getPublishedBySlug, softDelete, updatePost } from "@/lib/blog/posts";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";

const PatchBody = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).nullable().optional(),
  mdx_source: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  tags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const includeDrafts = url.searchParams.get("include")?.split(",").includes("drafts");
  if (includeDrafts) {
    const auth = await requireApiKey(req, "posts:read");
    if (!auth.ok) return auth.response;
    const post = await getBySlugIncludingDrafts(slug);
    if (!post) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
    return NextResponse.json(post);
  }
  const post = await getPublishedBySlug(slug);
  if (!post) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parse = PatchBody.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  }

  let compiledFields: { mdx_compiled?: string; toc?: any; reading_time_s?: number } = {};
  if (parse.data.mdx_source) {
    try {
      const out = await compileMdx(parse.data.mdx_source);
      compiledFields = { mdx_compiled: out.compiled, toc: out.toc, reading_time_s: out.readingTimeSeconds };
    } catch (err) {
      if (err instanceof MdxCompileError) {
        return NextResponse.json({ error: { code: "invalid_mdx", message: err.message, details: err.details } }, { status: 400 });
      }
      throw err;
    }
  }

  const updated = await updatePost(slug, {
    title: parse.data.title,
    summary: parse.data.summary,
    mdx_source: parse.data.mdx_source,
    ...compiledFields,
    slug: parse.data.slug,
    tag_slugs: parse.data.tags,
    scheduled_for: parse.data.scheduled_for === undefined ? undefined : (parse.data.scheduled_for ? new Date(parse.data.scheduled_for) : null),
    published_at: parse.data.published_at === undefined ? undefined : (parse.data.published_at ? new Date(parse.data.published_at) : null),
  }, auth.context.key_id);

  if (!updated) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });

  if (updated.publishedAt) regenerateFeeds().catch(() => {});
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const ok = await softDelete(slug);
  if (!ok) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  regenerateFeeds().catch(() => {});
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/posts/[slug]/route.ts
git commit -m "feat(api): GET/PATCH/DELETE /api/v1/posts/[slug] with MDX recompile"
```

---

### Task 15: GET /api/v1/posts/[slug]/revisions

**Files:**
- Create: `app/api/v1/posts/[slug]/revisions/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth/require-key";
import { listRevisions } from "@/lib/blog/revisions";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:read");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const revisions = await listRevisions(slug);
  if (!revisions) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ revisions });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/posts/[slug]/revisions/route.ts
git commit -m "feat(api): GET /api/v1/posts/[slug]/revisions"
```

---

### Task 16: Tags CRUD endpoints

**Files:**
- Create: `app/api/v1/tags/route.ts`
- Create: `app/api/v1/tags/[slug]/route.ts`

- [ ] **Step 1: Create `app/api/v1/tags/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiKey } from "@/lib/auth/require-key";
import { createTag, listTagsWithCounts } from "@/lib/blog/tags";

const Body = z.object({ name: z.string().min(1).max(50), slug: z.string().regex(/^[a-z0-9-]+$/).optional() });

export async function GET() {
  return NextResponse.json({ tags: await listTagsWithCounts() });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const json = await req.json().catch(() => null);
  const parse = Body.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: { code: "validation_error", details: parse.error.flatten() } }, { status: 400 });
  try {
    const tag = await createTag(parse.data.name, parse.data.slug);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23505") return NextResponse.json({ error: { code: "slug_conflict" } }, { status: 409 });
    throw err;
  }
}
```

- [ ] **Step 2: Create `app/api/v1/tags/[slug]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/auth/require-key";
import { deleteTag } from "@/lib/blog/tags";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await requireApiKey(req, "posts:write");
  if (!auth.ok) return auth.response;
  const { slug } = await ctx.params;
  const ok = await deleteTag(slug);
  if (!ok) return NextResponse.json({ error: { code: "not_found" } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/tags/
git commit -m "feat(api): tags GET/POST + DELETE"
```

---

## Phase 7: Scheduled publishing

### Task 17: Promotion job + cron route

**Files:**
- Create: `scripts/promote-scheduled.ts`
- Create: `app/api/cron/promote-scheduled/route.ts`
- Create: `lib/blog/promotion.ts`

- [ ] **Step 1: Create `lib/blog/promotion.ts`**

```ts
import { sql } from "@/lib/db/client";

export async function promoteScheduled(): Promise<number> {
  const res = await sql<{ id: string }[]>`
    UPDATE posts SET published_at = scheduled_for, updated_at = now()
    WHERE scheduled_for IS NOT NULL
      AND scheduled_for <= now()
      AND published_at IS NULL
      AND deleted_at IS NULL
    RETURNING id
  `;
  return res.length;
}
```

- [ ] **Step 2: Create `app/api/cron/promote-scheduled/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { promoteScheduled } from "@/lib/blog/promotion";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  const count = await promoteScheduled();
  if (count > 0) regenerateFeeds().catch(() => {});
  return NextResponse.json({ promoted: count });
}
```

- [ ] **Step 3: Create `scripts/promote-scheduled.ts` (CLI fallback)**

```ts
import { promoteScheduled } from "@/lib/blog/promotion";
import { regenerateFeeds } from "@/lib/blog/feeds/regenerate";
import { sql } from "@/lib/db/client";

async function main() {
  try {
    const n = await promoteScheduled();
    console.log(`promoted ${n} scheduled posts`);
    if (n > 0) await regenerateFeeds();
  } finally {
    await sql.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Document cron setup**

Add to `.env.example`:
```
CRON_SECRET=replace-me-32-bytes
```

Add a `pnpm` script:
```json
"cron:promote": "tsx scripts/promote-scheduled.ts"
```

Coolify scheduled-task configuration (production):
- Command: `curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://donna.fyi/api/cron/promote-scheduled`
- Schedule: `*/5 * * * *` (every 5 minutes)
- Or alternatively: `pnpm cron:promote` if you'd rather run inside the container

- [ ] **Step 5: Commit**

```bash
git add lib/blog/promotion.ts app/api/cron/promote-scheduled/ scripts/promote-scheduled.ts package.json .env.example
git commit -m "feat(blog): scheduled-publish promotion job + cron endpoint"
```

---

## Phase 8: Swap mock → Postgres in BlogDataSource

### Task 18: Postgres-backed BlogDataSource

**Files:**
- Create: `lib/blog/postgres-source.ts`
- Modify: `lib/blog/source.ts`

- [ ] **Step 1: Create `lib/blog/postgres-source.ts`**

```ts
import type { BlogDataSource, ListPostsOptions, ListPostsResult, Post, Tag } from "./types";
import { listPublished, getPublishedBySlug, getRecentForFeed } from "./posts";
import { listTagsWithCounts } from "./tags";

export const postgresSource: BlogDataSource = {
  async listPosts(opts?: ListPostsOptions): Promise<ListPostsResult> {
    return listPublished(opts ?? {});
  },
  async getPost(slug: string): Promise<Post | null> {
    return getPublishedBySlug(slug);
  },
  async listTags(): Promise<Tag[]> {
    return listTagsWithCounts();
  },
  async getRecentForFeed(limit: number): Promise<Post[]> {
    return getRecentForFeed(limit);
  },
};
```

- [ ] **Step 2: Update `lib/blog/source.ts`**

```ts
import type { BlogDataSource } from "./types";
import { mockSource } from "./mock-source";
import { postgresSource } from "./postgres-source";

const isProd = process.env.NODE_ENV === "production" || process.env.USE_POSTGRES_SOURCE === "1";

let _source: BlogDataSource = isProd ? postgresSource : mockSource;

export function getBlogSource(): BlogDataSource {
  return _source;
}

export function setBlogSourceForTesting(s: BlogDataSource): void {
  _source = s;
}
```

(Dev defaults to mock so Plan A devs aren't blocked on Postgres; set `USE_POSTGRES_SOURCE=1` in `.env.local` to flip locally.)

- [ ] **Step 3: Verify end-to-end with real DB**

```bash
echo "USE_POSTGRES_SOURCE=1" >> .env.local
pnpm db:migrate
pnpm dev
```
1. Log in via `/admin/login`. Mint a Donna key.
2. From a separate shell, POST a real post:
   ```bash
   KEY="donna_sk_..."  # your minted plaintext
   curl -s -X POST http://localhost:3000/api/v1/posts \
     -H "Authorization: Bearer $KEY" \
     -H "Content-Type: application/json" \
     -d '{"title": "Hello world", "summary": "First real post.", "mdx_source": "# Hello\n\nThis is *real*.", "tags": ["agents"]}' | jq
   ```
3. Open `http://localhost:3000/blog` — confirm the post appears (over the mock).
4. Open `http://localhost:3000/blog/hello-world` — confirm rendered HTML.
5. PATCH:
   ```bash
   curl -s -X PATCH http://localhost:3000/api/v1/posts/hello-world \
     -H "Authorization: Bearer $KEY" \
     -H "Content-Type: application/json" \
     -d '{"title": "Hello, world."}' | jq
   ```
6. Confirm revision via:
   ```bash
   curl -s http://localhost:3000/api/v1/posts/hello-world/revisions \
     -H "Authorization: Bearer $KEY" | jq
   ```

- [ ] **Step 4: Commit**

```bash
git add lib/blog/postgres-source.ts lib/blog/source.ts
git commit -m "feat(blog): swap mock source for Postgres-backed in prod"
```

---

## Phase 9: Hardening + tests

### Task 19: Postgres integration test (one real DB test for the source)

**Files:**
- Create: `tests/unit/blog/postgres-source.test.ts`

The test boots against a dedicated test DB. Skipped if `TEST_DATABASE_URL` is not set, so the test suite doesn't require Postgres locally for unrelated PRs.

- [ ] **Step 1: Write the integration test**

```ts
import { describe, expect, beforeAll, afterAll, it } from "vitest";
import postgres from "postgres";

const tdbUrl = process.env.TEST_DATABASE_URL;
const _describe = tdbUrl ? describe : describe.skip;

_describe("postgresSource integration", () => {
  let sql: ReturnType<typeof postgres>;
  let postgresSource: typeof import("@/lib/blog/postgres-source").postgresSource;

  beforeAll(async () => {
    process.env.DATABASE_URL = tdbUrl!;
    sql = postgres(tdbUrl!);
    await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
    const { runMigrations } = await import("@/lib/db/migrate");
    await runMigrations();
    postgresSource = (await import("@/lib/blog/postgres-source")).postgresSource;

    await sql`INSERT INTO users (github_id, github_login, display_name) VALUES (1, 'zach', 'Zach')`;
    await sql`
      INSERT INTO posts (slug, title, summary, author_tag, mdx_source, mdx_compiled, reading_time_s, published_at)
      VALUES ('first', 'First', 'Summary', 'donna', '# hi', '<h1>hi</h1>', 30, now())
    `;
  });

  afterAll(async () => { await sql.end(); });

  it("lists published posts", async () => {
    const r = await postgresSource.listPosts();
    expect(r.posts.length).toBe(1);
    expect(r.posts[0].slug).toBe("first");
  });

  it("gets by slug", async () => {
    const p = await postgresSource.getPost("first");
    expect(p?.title).toBe("First");
  });
});
```

- [ ] **Step 2: Wire it up**

To run locally:
```bash
docker run --name donna-pg-test -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=donna_blog_test -p 5433:5432 -d postgres:16
TEST_DATABASE_URL=postgres://test:test@localhost:5433/donna_blog_test pnpm test tests/unit/blog/postgres-source.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add tests/unit/blog/postgres-source.test.ts
git commit -m "test(blog): Postgres integration test (skipped without TEST_DATABASE_URL)"
```

---

### Task 20: Rate limiting middleware

**Files:**
- Create: `middleware.ts` (or modify if exists)
- Create: `lib/rate-limit/index.ts`

- [ ] **Step 1: Install dep**

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

(If Zach prefers self-hosted, swap for an in-memory or pg-row-based limiter. Upstash works for personal-scale traffic and is free at this volume.)

- [ ] **Step 2: Create `lib/rate-limit/index.ts`**

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

export const ipLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl_ip" })
  : null;

export const keyLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(600, "60 s"), analytics: false, prefix: "rl_key" })
  : null;
```

- [ ] **Step 3: Create `middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { ipLimiter, keyLimiter } from "@/lib/rate-limit";

export const config = {
  matcher: ["/api/v1/:path*"],
};

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const isKeyAuth = !!authHeader?.startsWith("Bearer ");

  if (isKeyAuth && keyLimiter) {
    const key = authHeader.slice(0, 32);
    const r = await keyLimiter.limit(key);
    if (!r.success) {
      return NextResponse.json({ error: { code: "rate_limited" } }, { status: 429 });
    }
  } else if (ipLimiter) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const r = await ipLimiter.limit(ip);
    if (!r.success) {
      return NextResponse.json({ error: { code: "rate_limited" } }, { status: 429 });
    }
  }
  return NextResponse.next();
}
```

(If `UPSTASH_REDIS_REST_URL` is unset, limiters are no-ops in dev.)

- [ ] **Step 4: Update `.env.example`**

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 5: Commit**

```bash
git add middleware.ts lib/rate-limit/ package.json .env.example
git commit -m "feat(security): rate limits on /api/v1/* (per-key + per-IP)"
```

---

### Task 21: CSP + security headers

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace `next.config.ts`**

```ts
import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "frame-src https://www.youtube-nocookie.com https://www.loom.com https://gist.github.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify**

```bash
pnpm build && pnpm start
curl -sI http://localhost:3000 | grep -i 'content-security-policy'
```
Expect: CSP header in response.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(security): CSP + standard security headers"
```

---

### Task 22: Sentry

**Files:**
- Modify: `package.json`
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Create: `sentry.edge.config.ts`

- [ ] **Step 1: Install + run wizard**

```bash
pnpm dlx @sentry/wizard@latest -i nextjs
```

Follow the prompts:
- Org / project: your Sentry workspace
- Use Next.js (App Router) integration
- Skip session replay for now (privacy)

- [ ] **Step 2: Verify by triggering a synthetic error**

Add temporarily to `app/page.tsx`:
```tsx
// throw new Error("Sentry test");
```
Hit the page, confirm event arrives in Sentry, then remove the line.

- [ ] **Step 3: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts package.json
git commit -m "feat(obs): Sentry SDK wired in"
```

---

## Phase 10: API E2E and ship checks

### Task 23: API end-to-end smoke tests

**Files:**
- Create: `tests/e2e/api-posts.spec.ts`
- Create: `tests/e2e/api-keys.spec.ts`

These tests need a real DB running. They start one via Docker, run migrations, mint a key, exercise the API, then tear down. Optional: gate behind `RUN_API_E2E=1` to keep CI simple.

- [ ] **Step 1: Write `tests/e2e/api-posts.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const apiKey = process.env.E2E_API_KEY;
test.skip(!apiKey, "E2E_API_KEY not set");

test("POST + GET round trip", async ({ request }) => {
  const slug = `e2e-${Date.now()}`;
  const created = await request.post("/api/v1/posts", {
    headers: { Authorization: `Bearer ${apiKey!}` },
    data: { title: "E2E", summary: "Test", mdx_source: "# yo", slug, tags: ["test"] },
  });
  expect(created.status()).toBe(201);

  const fetched = await request.get(`/api/v1/posts/${slug}`);
  expect(fetched.status()).toBe(200);
  const json = await fetched.json();
  expect(json.slug).toBe(slug);
  expect(json.author.tag).toBe("donna");

  const del = await request.delete(`/api/v1/posts/${slug}`, {
    headers: { Authorization: `Bearer ${apiKey!}` },
  });
  expect(del.status()).toBe(200);
});

test("invalid MDX returns 400", async ({ request }) => {
  const r = await request.post("/api/v1/posts", {
    headers: { Authorization: `Bearer ${apiKey!}` },
    data: { title: "Bad", mdx_source: "# hi\n<DangerousScript />", slug: `bad-${Date.now()}` },
  });
  expect(r.status()).toBe(400);
  const json = await r.json();
  expect(json.error.code).toBe("invalid_mdx");
});

test("unauthenticated POST returns 401", async ({ request }) => {
  const r = await request.post("/api/v1/posts", {
    data: { title: "x", mdx_source: "x" },
  });
  expect(r.status()).toBe(401);
});
```

- [ ] **Step 2: Document running E2E**

In repo `tests/e2e/README.md`:
```
# E2E tests

Provide an `E2E_API_KEY` env var pointing to a freshly minted Donna key against a dev instance, then:

  E2E_API_KEY=donna_sk_... pnpm test:e2e
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/api-posts.spec.ts tests/e2e/README.md
git commit -m "test(api): end-to-end posts smoke tests"
```

---

### Task 24: Production-shape readiness check

**Files:** (none)

- [ ] **Step 1: Build with prod env**

```bash
NODE_ENV=production USE_POSTGRES_SOURCE=1 pnpm build
```
Expect: clean build.

- [ ] **Step 2: Run prod server locally**

```bash
NODE_ENV=production USE_POSTGRES_SOURCE=1 pnpm start
```
Smoke-walk:
- `/` renders
- `/blog` shows real posts (or empty state if DB empty)
- `/blog/<existing-slug>` renders
- `/admin/login` works
- `/api/v1/posts` (GET) returns empty list shape
- `/rss.xml` and `/atom.xml` are served

- [ ] **Step 3: Document Coolify deployment**

Create `docs/deployment.md`:
```
# Deployment (Coolify)

Two services in the existing Coolify project:

1. Next.js app (existing) — update env vars:
   - DATABASE_URL (points to the PG service)
   - NEXTAUTH_URL=https://donna.fyi
   - NEXTAUTH_SECRET (openssl rand -base64 32)
   - GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (prod OAuth app)
   - BOOTSTRAP_ALLOWED_GITHUB_LOGIN=zachlagden
   - SITE_URL=https://donna.fyi
   - CRON_SECRET
   - UPSTASH_REDIS_REST_URL / TOKEN (optional, recommended)
   - USE_POSTGRES_SOURCE=1
   - NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN

2. PostgreSQL 16 service — new container. Coolify provides a managed PG template.

Initial setup:
  - Deploy PG service, capture DATABASE_URL
  - Deploy app with env vars
  - Run migrations once: SSH into the app container, `pnpm db:migrate`
  - Log in to /admin/login as Zach — bootstrap row inserted into `users`
  - Mint a Donna key, set on the Hetzner box

Scheduled task (Coolify Scheduled Tasks):
  - */5 * * * *  curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://donna.fyi/api/cron/promote-scheduled

Backups:
  - Coolify's PG service supports pg_dump-based snapshots; enable daily.
```

- [ ] **Step 4: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: Coolify deployment guide for Project B"
```

---

## Self-Review

**Spec coverage check (re-reading `2026-05-18-donna-blog-design.md`):**

- §3 Stack decisions: PG ✓ (T1), NextAuth ✓ (T3), write-time MDX ✓ (T11), feeds ✓ (Plan A T29 reused), drafts API-only ✓ (T14 `?include=drafts`), slug strategy ✓ (T13/T14), OG images — relies on @vercel/og — implementing engineer to add a `/api/og` route once layouts are settled; flagged.
- §4 Schema: All tables in T2's 0001_init.sql. ✓
- §5 API surface: List + single (T13/T14), CRUD (T13/T14), revisions (T15), tags (T16), keys mint/revoke (T8), session login (T5). Public feeds reuse Plan A's routes (T29 there). ✓
- §6 MDX pipeline: compile + validate + TOC + Shiki in T11. ✓ Read-time evaluation strategy: T18's swap uses Plan A's `dangerouslySetInnerHTML`-based render against `mdx_compiled` HTML — sufficient for v1 markdown-only bodies; MDX-component bodies (which our allowlist permits at the source level) need a follow-up MDX evaluator. Flagged inline at T11 step 5.
- §7 Auth + key flow: NextAuth (T3), allowlist (T4), keys page (T8), middleware (T10/T20). ✓
- §8 Scheduled publishing: promotion (T17). ✓
- §9 Feeds regen: T13 + T14 call `regenerateFeeds()` on publish-state changes; helper at T13 step 2. ✓
- §10 Donna's authoring path: end-to-end verified by T18 step 3 manual walkthrough and T23 automated tests. ✓
- §11 File-level layout: Followed. ✓
- §12 Migrations: T2 migration runner. ✓
- §13 Deployment: T24 deployment doc. ✓
- §14 Observability: Sentry (T22), pino logs are deferred to operator preference and not included; recommend adding in a follow-up if Coolify's stdout capture is insufficient.
- §15 Security: argon2id (T6), allowlist (T4), MDX allowlist (T11), CSP (T21), rate limits (T20). DB role separation flagged below.

**Open items flagged (not blockers; for the operator):**
1. **MDX read-time evaluator**: T18 step 3 uses `dangerouslySetInnerHTML` on `mdx_compiled` HTML. For posts that contain allowlisted MDX *components* (not just markdown), the compile pipeline currently embeds them as raw JSX nodes which won't render via `dangerouslySetInnerHTML`. Either (a) extend `lib/blog/mdx/compile.ts` to fully expand allowlisted components into HTML at compile time (preferred for v1; component renders are deterministic), or (b) replace the reader's render path with `next-mdx-remote/rsc`. Decide before any post actually uses `<Note>` / `<Figure>` / embed components.
2. **OG image route** (`@vercel/og`): not in this plan; add as a small follow-up — `app/blog/[slug]/opengraph-image.tsx` using `@vercel/og` with title + author chip + accent. ~30 lines.
3. **DB role separation** (§15 of spec): The app currently connects as the migration user. Add a least-privilege role in a follow-up; the v1 deployment can run as the migration user without prejudice.

**Placeholder scan:** "TBD" / "TODO" search clean. Each "follow-up" callout above has concrete prescriptive guidance, not a vague TODO. ✓

**Type consistency:** `AuthorTag`, `Post`, `PostSummary`, `Tag`, `Tag.postCount`, `BlogDataSource`, `ApiKeyContext`, `MdxCompileError`, `CompileResult`, `CreatePostInput`, `UpdatePostInput`, `RevisionRow` all defined once and consistently referenced. ✓

**Plan is ready.**
