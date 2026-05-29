"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CHANNELS, CHANNEL_LABELS, STATUSES } from "@/lib/constants";
import type { LeadChannel, LeadStatus } from "@/lib/constants";
import type { Lead, LeadInput } from "@/lib/types";
import { toDateInputValue } from "@/lib/followup";
import { cn } from "@/lib/utils";

type LeadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSave: (input: LeadInput, id?: string) => Promise<void>;
};

const emptyForm = (): LeadInput => ({
  name: "",
  company: "",
  contact: "",
  channel: null,
  status: "Cold",
  value: "",
  followup: "",
  notes: "",
});

export function LeadModal({ open, onOpenChange, lead, onSave }: LeadModalProps) {
  const [form, setForm] = useState<LeadInput>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (lead) {
        setForm({
          name: lead.name,
          company: lead.company ?? "",
          contact: lead.contact ?? "",
          channel: lead.channel,
          status: lead.status,
          value: lead.value ?? "",
          followup: toDateInputValue(lead.followup),
          notes: lead.notes ?? "",
        });
      } else {
        setForm(emptyForm());
      }
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form, lead?.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-input bg-background px-3"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company ?? ""}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="border border-input bg-background px-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={form.contact ?? ""}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="border border-input bg-background px-3"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => (
                <Button
                  key={channel}
                  type="button"
                  variant={form.channel === channel ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      channel: form.channel === channel ? null : channel,
                    })
                  }
                >
                  {CHANNEL_LABELS[channel]}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as LeadStatus })
                }
                className={cn(
                  "h-10 w-full border border-input bg-background px-3 text-sm",
                  "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                )}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followup">Follow-up date</Label>
              <Input
                id="followup"
                type="date"
                value={form.followup ?? ""}
                onChange={(e) => setForm({ ...form, followup: e.target.value })}
                className="border border-input bg-background px-3"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Value (KES)</Label>
            <Input
              id="value"
              placeholder="e.g. 50000"
              value={form.value ?? ""}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="border border-input bg-background px-3"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border border-input bg-background px-3 py-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
