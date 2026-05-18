import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __donnaPgClient: Sql | undefined;
}

function createClient(): Sql {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    transform: { undefined: null },
  });
}

export function getDb(): Sql {
  if (!global.__donnaPgClient) {
    global.__donnaPgClient = createClient();
  }
  return global.__donnaPgClient;
}

export const sql: Sql = new Proxy(
  (function () {}) as unknown as Sql,
  {
    apply(_t, _ctx, args) {
      return (getDb() as unknown as (...a: unknown[]) => unknown)(...args);
    },
    get(_t, prop) {
      const db = getDb();
      const val = (db as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(db) : val;
    },
  }
);
