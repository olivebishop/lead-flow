"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/SearchBar";
import { PipelineView } from "@/components/PipelineView";
import { ListView } from "@/components/ListView";
import { LeadModal } from "@/components/LeadModal";
import { DetailPanel } from "@/components/DetailPanel";
import { exportLeadsToCsv } from "@/lib/csv";
import type { LeadChannel, LeadStatus } from "@/lib/constants";
import type { Lead, LeadInput } from "@/lib/types";

function toPayload(input: LeadInput) {
  return {
    name: input.name.trim(),
    company: input.company?.trim() || null,
    contact: input.contact?.trim() || null,
    channel: input.channel || null,
    status: input.status || "Cold",
    value: input.value?.trim() || null,
    followup: input.followup || null,
    notes: input.notes?.trim() || null,
  };
}

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<LeadChannel | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads");
    if (!res.ok) throw new Error("Failed to fetch leads");
    return res.json() as Promise<Lead[]>;
  }, []);

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => toast.error("Failed to load leads"))
      .finally(() => setLoading(false));
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q) ||
        lead.contact?.toLowerCase().includes(q);
      const matchesChannel =
        channelFilter === "ALL" || lead.channel === channelFilter;
      const matchesStatus =
        statusFilter === "ALL" || lead.status === statusFilter;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [leads, search, channelFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      hot: leads.filter((l) => l.status === "Interested").length,
      closed: leads.filter((l) => l.status === "Closed").length,
    }),
    [leads]
  );

  const syncSelectedLead = (updated: Lead) => {
    setSelectedLead((current) => (current?.id === updated.id ? updated : current));
  };

  const handleSaveLead = async (input: LeadInput, id?: string) => {
    const payload = toPayload(input);

    if (id) {
      const previous = leads;
      const optimistic = leads.map((l) =>
        l.id === id
          ? {
              ...l,
              ...payload,
              followup: payload.followup,
              updatedAt: new Date().toISOString(),
            }
          : l
      );
      setLeads(optimistic);
      syncSelectedLead(optimistic.find((l) => l.id === id)!);

      try {
        const res = await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = (await res.json()) as Lead;
        setLeads((current) =>
          current.map((l) => (l.id === id ? updated : l))
        );
        syncSelectedLead(updated);
        toast.success("Lead updated");
      } catch {
        setLeads(previous);
        syncSelectedLead(previous.find((l) => l.id === id)!);
        toast.error("Failed to update lead");
        throw new Error("update failed");
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Lead = {
        id: tempId,
        ...payload,
        followup: payload.followup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLeads((current) => [optimistic, ...current]);

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = (await res.json()) as Lead;
        setLeads((current) =>
          current.map((l) => (l.id === tempId ? created : l))
        );
        toast.success("Lead created");
      } catch {
        setLeads((current) => current.filter((l) => l.id !== tempId));
        toast.error("Failed to create lead");
        throw new Error("create failed");
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    const previous = leads;
    const optimistic = leads.map((l) =>
      l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l
    );
    setLeads(optimistic);
    syncSelectedLead(optimistic.find((l) => l.id === id)!);

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as Lead;
      setLeads((current) => current.map((l) => (l.id === id ? updated : l)));
      syncSelectedLead(updated);
      toast.success(`Moved to ${status}`);
    } catch {
      setLeads(previous);
      syncSelectedLead(previous.find((l) => l.id === id)!);
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    const previous = leads;
    const optimistic = leads.map((l) =>
      l.id === id ? { ...l, notes, updatedAt: new Date().toISOString() } : l
    );
    setLeads(optimistic);
    syncSelectedLead(optimistic.find((l) => l.id === id)!);

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as Lead;
      setLeads((current) => current.map((l) => (l.id === id ? updated : l)));
      syncSelectedLead(updated);
      toast.success("Notes saved");
    } catch {
      setLeads(previous);
      syncSelectedLead(previous.find((l) => l.id === id)!);
      toast.error("Failed to save notes");
    }
  };

  const handleDelete = async (id: string) => {
    const previous = leads;
    setLeads((current) => current.filter((l) => l.id !== id));

    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Lead deleted");
    } catch {
      setLeads(previous);
      toast.error("Failed to delete lead");
    }
  };

  const openAddModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setModalOpen(true);
    setDetailOpen(false);
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="font-heading text-xl font-semibold tracking-wider uppercase">
            LeadFlow
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <StatPill label="Total" value={stats.total} />
            <StatPill label="Hot" value={stats.hot} />
            <StatPill label="Closed" value={stats.closed} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportLeadsToCsv(leads);
                toast.success("CSV exported");
              }}
              disabled={leads.length === 0}
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={openAddModal}>
              <Plus className="size-3.5" />
              Add Lead
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-6 sm:px-6">
        <Tabs defaultValue="pipeline">
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <SearchBar
            search={search}
            onSearchChange={setSearch}
            channel={channelFilter}
            onChannelChange={setChannelFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {loading ? (
            <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
              Loading leads...
            </div>
          ) : (
            <>
              <TabsContent value="pipeline" className="mt-4">
                <PipelineView
                  leads={filteredLeads}
                  onSelectLead={openDetail}
                  onMoveLead={handleUpdateStatus}
                />
              </TabsContent>
              <TabsContent value="list" className="mt-4">
                <ListView
                  leads={filteredLeads}
                  onSelectLead={openDetail}
                  onEditLead={openEditModal}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <LeadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        lead={editingLead}
        onSave={handleSaveLead}
      />

      <DetailPanel
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateStatus={handleUpdateStatus}
        onSaveNotes={handleSaveNotes}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 border border-border px-3 py-1.5 text-xs">
      <span className="font-semibold tracking-wider uppercase">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}
