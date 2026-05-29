"use client";

import { formatFollowup, formatValue } from "@/lib/followup";
import {
  CHANNEL_LABELS,
  STATUSES,
} from "@/lib/constants";
import type { LeadChannel } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type PipelineViewProps = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
};

function LeadCard({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  const followup = formatFollowup(lead.followup);
  const value = formatValue(lead.value);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-none border border-border bg-card p-3 text-left shadow-sm transition-all hover:border-foreground/20 hover:shadow-md"
    >
      <p className="font-medium text-foreground">{lead.name}</p>
      {lead.company && (
        <p className="mt-0.5 text-xs text-muted-foreground">{lead.company}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {lead.channel && (
          <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {CHANNEL_LABELS[lead.channel as LeadChannel]}
          </span>
        )}
        {value && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {value}
          </span>
        )}
      </div>
      {followup && (
        <span
          className={cn(
            "mt-2 inline-block text-[10px] font-medium",
            followup.className
          )}
        >
          {followup.label}
        </span>
      )}
    </button>
  );
}

export function PipelineView({ leads, onSelectLead }: PipelineViewProps) {
  return (
    <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 lg:grid-cols-6">
      {STATUSES.map((status) => {
        const columnLeads = leads.filter((l) => l.status === status);
        return (
          <div
            key={status}
            className="flex min-w-[200px] flex-col border border-border bg-muted/30"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <h3 className="text-xs font-semibold tracking-wider uppercase">
                {status}
              </h3>
              <span className="text-xs text-muted-foreground">
                {columnLeads.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {columnLeads.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-none border border-dashed border-border p-6 text-center">
                  <p className="text-xs text-muted-foreground">No leads yet</p>
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => onSelectLead(lead)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
