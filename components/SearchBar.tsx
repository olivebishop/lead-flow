"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CHANNELS, STATUSES, CHANNEL_LABELS } from "@/lib/constants";
import type { LeadChannel, LeadStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  channel: LeadChannel | "ALL";
  onChannelChange: (value: LeadChannel | "ALL") => void;
  status: LeadStatus | "ALL";
  onStatusChange: (value: LeadStatus | "ALL") => void;
};

export function SearchBar({
  search,
  onSearchChange,
  channel,
  onChannelChange,
  status,
  onStatusChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name, company, contact..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-input bg-background pl-9"
        />
      </div>
      <select
        value={channel}
        onChange={(e) => onChannelChange(e.target.value as LeadChannel | "ALL")}
        className={cn(
          "h-10 rounded-none border border-input bg-background px-3 text-sm",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        )}
      >
        <option value="ALL">All channels</option>
        {CHANNELS.map((c) => (
          <option key={c} value={c}>
            {CHANNEL_LABELS[c]}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as LeadStatus | "ALL")}
        className={cn(
          "h-10 rounded-none border border-input bg-background px-3 text-sm",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        )}
      >
        <option value="ALL">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
