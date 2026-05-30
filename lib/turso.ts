export type TursoConfig = {
  url: string;
  authToken: string;
};

/** Resolve Turso credentials from Vercel integration or manual .env */
export function getTursoConfig(): TursoConfig | null {
  const url =
    process.env.TURSO_DATABASE_URL ??
    process.env.LIBSQL_DATABASE_URL ??
    process.env.LIBSQL_URL;

  const authToken =
    process.env.TURSO_AUTH_TOKEN ??
    process.env.LIBSQL_DATABASE_TOKEN ??
    process.env.LIBSQL_AUTH_TOKEN;

  if (!url || !authToken) return null;

  return { url, authToken };
}

export function isTursoConfigured() {
  return getTursoConfig() !== null;
}
