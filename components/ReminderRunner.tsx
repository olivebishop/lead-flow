import { isReminderConfigured, sendFollowupReminders } from "@/lib/reminders";

export async function ReminderRunner() {
  if (!isReminderConfigured()) return null;

  try {
    await sendFollowupReminders();
  } catch {
    // Don't block the page if email fails
  }

  return null;
}
