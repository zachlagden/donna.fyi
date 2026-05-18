# E2E tests

Most specs run against the local dev server (auto-started by Playwright's webServer config).

The API specs (`api-*.spec.ts`) require:

1. A live dev server with a real Postgres connection (`USE_POSTGRES_SOURCE=1` + valid `DATABASE_URL` in `.env.local`)
2. A minted API key for Donna

Then:

  E2E_API_KEY=donna_sk_... pnpm test:e2e

The api-* specs auto-skip when `E2E_API_KEY` is unset.
