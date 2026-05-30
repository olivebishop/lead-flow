import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL as PrismaLibSQLNode } from "@prisma/adapter-libsql";
import { PrismaLibSQL as PrismaLibSQLWeb } from "@prisma/adapter-libsql/web";
import { getTursoConfig } from "./turso";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createTursoAdapter(config: { url: string; authToken: string }) {
  // Vercel serverless works reliably with the web/fetch-based adapter
  const Adapter = process.env.VERCEL ? PrismaLibSQLWeb : PrismaLibSQLNode;
  return new Adapter({
    url: config.url,
    authToken: config.authToken,
  });
}

function createPrismaClient() {
  const turso = getTursoConfig();

  if (turso) {
    return new PrismaClient({
      adapter: createTursoAdapter(turso),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

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
    adapter: createTursoAdapter(turso),
  });
}
