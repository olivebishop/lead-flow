"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatFollowup, formatValue } from "@/lib/followup";
import {
  CHANNEL_LABELS,
  STATUSES,
} from "@/lib/constants";
import type { LeadChannel, LeadStatus } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type DetailPanelProps = {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => Promise<void>;
};

export function DetailPanel({
  lead,
  open,
  onOpenChange,
  onUpdateStatus,
  onSaveNotes,
  onEdit,
  onDelete,
}: DetailPanelProps) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes ?? "");
    }
  }, [lead]);

  if (!lead) return null;

  const followup = formatFollowup(lead.followup);
  const value = formatValue(lead.value);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onSaveNotes(lead.id, notes);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(lead.id);
      setDeleteOpen(false);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{lead.name}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 px-8 pb-8">
            <div className="space-y-3">
              {lead.company && (
                <DetailRow label="Company" value={lead.company} />
              )}
              {lead.contact && (
                <DetailRow label="Contact" value={lead.contact} />
              )}
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Status
                </p>
                <span className="mt-1 inline-block text-sm text-muted-foreground">
                  {lead.status}
                </span>
              </div>
              {lead.channel && (
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Channel
                  </p>
                  <span className="mt-1 inline-block text-sm text-muted-foreground">
                    {CHANNEL_LABELS[lead.channel as LeadChannel]}
                  </span>
                </div>
              )}
              {value && <DetailRow label="Value" value={value} />}
              {followup && (
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Follow-up
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block text-sm font-medium",
                      followup.className
                    )}
                  >
                    {followup.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Move to stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.filter((s) => s !== lead.status).map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="xs"
                    onClick={() => onUpdateStatus(lead.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Notes
              </p>
              <Textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border border-input bg-background px-3 py-2"
              />
              <Button
                className="mt-2"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (lead.notes ?? "")}
              >
                {savingNotes ? "Saving..." : "Save notes"}
              </Button>
            </div>

            <div className="flex gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {lead.name} from your pipeline. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
