import type { LeadChannel, LeadStatus } from "./constants";

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
