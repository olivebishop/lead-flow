import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { getTursoConfig } from "./turso";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const turso = getTursoConfig();

  if (turso) {
    return new PrismaClient({
      adapter: new PrismaLibSQL({
        url: turso.url,
        authToken: turso.authToken,
      }),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function createLocalPrismaClient() {
  return new PrismaClient();
}

export function createTursoPrismaClient() {
  const turso = getTursoConfig();
  if (!turso) {
    throw new Error(
      "Turso not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (from Vercel Turso integration)."
    );
  }
  return new PrismaClient({
    adapter: new PrismaLibSQL({
      url: turso.url,
      authToken: turso.authToken,
    }),
  });
}
