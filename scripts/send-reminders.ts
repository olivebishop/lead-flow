import { sendFollowupReminders } from "../lib/reminders";

async function main() {
  const result = await sendFollowupReminders();

  if (result.skipped) {
    console.log(result.reason ?? "No reminders sent.");
    return;
  }

  console.log(`Sent reminder for ${result.sent} lead(s): ${result.leads.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
