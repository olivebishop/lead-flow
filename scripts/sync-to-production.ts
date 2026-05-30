import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";
import { createLocalPrismaClient, createTursoPrismaClient } from "../lib/prisma";
import { getTursoConfig } from "../lib/turso";

async function pushSchemaToTurso() {
  const turso = getTursoConfig();
  if (!turso) throw new Error("Turso credentials missing");

  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8" }
  );

  const client = createClient({
    url: turso.url,
    authToken: turso.authToken,
  });

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  await client.close();
  console.log("Schema pushed to Turso.");
}

async function syncLeads() {
  const local = createLocalPrismaClient();
  const remote = createTursoPrismaClient();

  try {
    const leads = await local.lead.findMany();
    console.log(`Found ${leads.length} lead(s) in local database.`);

    for (const lead of leads) {
      await remote.lead.upsert({
        where: { id: lead.id },
        create: lead,
        update: {
          name: lead.name,
          company: lead.company,
          contact: lead.contact,
          channel: lead.channel,
          status: lead.status,
          value: lead.value,
          followup: lead.followup,
          followupReminderSentAt: lead.followupReminderSentAt,
          notes: lead.notes,
          updatedAt: lead.updatedAt,
        },
      });
    }

    console.log(`Synced ${leads.length} lead(s) to production (Turso).`);
  } finally {
    await local.$disconnect();
    await remote.$disconnect();
  }
}

async function main() {
  if (!getTursoConfig()) {
    console.error(`
Turso credentials not found in environment.

Add these to your local .env (copy from Vercel → Settings → Environment Variables
after connecting the Turso integration):

  TURSO_DATABASE_URL="libsql://..."
  TURSO_AUTH_TOKEN="..."

Your SQLite file (prisma/dev.db) stays local and is never committed to GitHub.
`);
    process.exit(1);
  }

  await pushSchemaToTurso();
  await syncLeads();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
