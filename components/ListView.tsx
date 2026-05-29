"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFollowup, formatValue } from "@/lib/followup";
import { CHANNEL_LABELS } from "@/lib/constants";
import type { LeadChannel } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type ListViewProps = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
};

export function ListView({ leads, onSelectLead, onEditLead }: ListViewProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No leads found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or add a new lead
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-none border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const followup = formatFollowup(lead.followup);
            const value = formatValue(lead.value);
            return (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => onSelectLead(lead)}
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.company ?? "—"}
                </TableCell>
                <TableCell>
                  {lead.channel
                    ? CHANNEL_LABELS[lead.channel as LeadChannel]
                    : "—"}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {lead.status}
                  </span>
                </TableCell>
                <TableCell>
                  {followup ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        followup.className
                      )}
                    >
                      {followup.label}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{value ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLead(lead);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    <span className="sr-only">Edit {lead.name}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
