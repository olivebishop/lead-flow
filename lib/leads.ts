import type { Lead as PrismaLead } from "@prisma/client";
import type { Lead, LeadInput } from "./types";
import { STATUSES, CHANNELS } from "./constants";
import type { LeadChannel, LeadStatus } from "./constants";

export function serializeLead(lead: PrismaLead): Lead {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    contact: lead.contact,
    channel: lead.channel as LeadChannel | null,
    status: lead.status as LeadStatus,
    value: lead.value,
    followup: lead.followup?.toISOString() ?? null,
    notes: lead.notes,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function parseLeadInput(body: Record<string, unknown>): LeadInput {
  const input: LeadInput = {
    name: String(body.name ?? "").trim(),
  };

  if ("company" in body) input.company = body.company ? String(body.company) : null;
  if ("contact" in body) input.contact = body.contact ? String(body.contact) : null;
  if ("channel" in body) {
    const channel = body.channel ? String(body.channel) : null;
    input.channel =
      channel && CHANNELS.includes(channel as LeadChannel)
        ? (channel as LeadChannel)
        : null;
  }
  if ("status" in body) {
    const status = String(body.status ?? "Cold");
    input.status = STATUSES.includes(status as LeadStatus)
      ? (status as LeadStatus)
      : "Cold";
  }
  if ("value" in body) input.value = body.value ? String(body.value) : null;
  if ("followup" in body) {
    input.followup = body.followup ? String(body.followup) : null;
  }
  if ("notes" in body) input.notes = body.notes ? String(body.notes) : null;

  return input;
}

export function toPrismaData(input: LeadInput) {
  return {
    name: input.name,
    company: input.company ?? null,
    contact: input.contact ?? null,
    channel: input.channel ?? null,
    status: input.status ?? "Cold",
    value: input.value ?? null,
    followup: input.followup ? new Date(input.followup) : null,
    notes: input.notes ?? null,
  };
}
