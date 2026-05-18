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
