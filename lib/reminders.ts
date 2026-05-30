import { endOfDay, format, startOfDay } from "date-fns";
import type { DbLead } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { getReminderEmailConfig, getResend } from "@/lib/email";
import { CHANNEL_LABELS } from "@/lib/constants";
import type { LeadChannel } from "@/lib/constants";
import { formatValue } from "@/lib/followup";

export type ReminderResult = {
  sent: number;
  leads: string[];
  skipped: boolean;
  reason?: string;
};

export function isReminderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_EMAIL);
}

function buildReminderEmail(leads: DbLead[]) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const rows = leads
    .map((lead) => {
      const parts = [
        `<strong>${lead.name}</strong>`,
        lead.company ? `Company: ${lead.company}` : null,
        lead.contact ? `Contact: ${lead.contact}` : null,
        lead.channel
          ? `Channel: ${CHANNEL_LABELS[lead.channel as LeadChannel]}`
          : null,
        `Status: ${lead.status}`,
        lead.value ? `Value: ${formatValue(lead.value)}` : null,
        lead.notes ? `Notes: ${lead.notes}` : null,
      ].filter(Boolean);

      return `<li style="margin-bottom:16px">${parts.join("<br />")}</li>`;
    })
    .join("");

  const html = `
    <div style="font-family:sans-serif;line-height:1.5;color:#171717">
      <h2 style="margin:0 0 8px">LeadFlow follow-up reminder</h2>
      <p style="margin:0 0 20px;color:#525252">You have ${leads.length} lead${leads.length === 1 ? "" : "s"} due for follow-up today — ${today}.</p>
      <ul style="margin:0;padding-left:20px">${rows}</ul>
    </div>
  `;

  const text = leads
    .map((lead) => {
      const lines = [
        `- ${lead.name}`,
        lead.company ? `  Company: ${lead.company}` : null,
        lead.contact ? `  Contact: ${lead.contact}` : null,
        lead.channel
          ? `  Channel: ${CHANNEL_LABELS[lead.channel as LeadChannel]}`
          : null,
        `  Status: ${lead.status}`,
        lead.value ? `  Value: ${formatValue(lead.value)}` : null,
        lead.notes ? `  Notes: ${lead.notes}` : null,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");

  return {
    subject: `LeadFlow: ${leads.length} follow-up${leads.length === 1 ? "" : "s"} due today`,
    html,
    text: `You have ${leads.length} follow-up${leads.length === 1 ? "" : "s"} due today (${today}).\n\n${text}`,
  };
}

export async function sendFollowupReminders(): Promise<ReminderResult> {
  if (!isReminderConfigured()) {
    return {
      sent: 0,
      leads: [],
      skipped: true,
      reason: "Reminder email not configured",
    };
  }

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const leads: DbLead[] = await prisma.lead.findMany({
    where: {
      followup: { gte: todayStart, lte: todayEnd },
      followupReminderSentAt: null,
    },
    orderBy: { name: "asc" },
  });

  if (leads.length === 0) {
    return { sent: 0, leads: [], skipped: true, reason: "No follow-ups due today" };
  }

  const { to, from } = getReminderEmailConfig();
  const resend = getResend();
  const email = buildReminderEmail(leads);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date();
  await prisma.lead.updateMany({
    where: { id: { in: leads.map((l: DbLead) => l.id) } },
    data: { followupReminderSentAt: now },
  });

  return {
    sent: leads.length,
    leads: leads.map((l: DbLead) => l.name),
    skipped: false,
  };
}

export function shouldResetReminder(
  existingFollowup: Date | null,
  nextFollowup: string | null | undefined
) {
  if (nextFollowup === undefined) return false;

  const oldDay = existingFollowup
    ? format(existingFollowup, "yyyy-MM-dd")
    : null;
  const newDay = nextFollowup ? format(new Date(nextFollowup), "yyyy-MM-dd") : null;

  return oldDay !== newDay;
}
