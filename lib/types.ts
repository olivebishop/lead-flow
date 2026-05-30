import type { LeadChannel, LeadStatus } from "./constants";

/** Lead row as stored in the database (Prisma query result). */
export type DbLead = {
  id: string;
  name: string;
  company: string | null;
  contact: string | null;
  channel: string | null;
  status: string;
  value: string | null;
  followup: Date | null;
  followupReminderSentAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  contact: string | null;
  channel: LeadChannel | null;
  status: LeadStatus;
  value: string | null;
  followup: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadInput = {
  name: string;
  company?: string | null;
  contact?: string | null;
  channel?: LeadChannel | null;
  status?: LeadStatus;
  value?: string | null;
  followup?: string | null;
  notes?: string | null;
};
