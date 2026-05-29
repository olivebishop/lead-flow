export const STATUSES = [
  "Cold",
  "Contacted",
  "Replied",
  "Interested",
  "Closed",
  "Dead",
] as const;

export type LeadStatus = (typeof STATUSES)[number];

export const CHANNELS = ["WHATSAPP", "EMAIL", "CALL"] as const;

export type LeadChannel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<LeadChannel, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  CALL: "Call",
};
