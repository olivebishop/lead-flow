import type { Lead } from "./types";

function escapeCsv(value: string | null | undefined): string {
  if (!value) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLeadsToCsv(leads: Lead[]): void {
  const headers = [
    "Name",
    "Company",
    "Contact",
    "Channel",
    "Status",
    "Value",
    "Follow-up",
    "Notes",
    "Created",
  ];

  const rows = leads.map((lead) =>
    [
      escapeCsv(lead.name),
      escapeCsv(lead.company),
      escapeCsv(lead.contact),
      escapeCsv(lead.channel),
      escapeCsv(lead.status),
      escapeCsv(lead.value),
      escapeCsv(lead.followup ? new Date(lead.followup).toISOString().split("T")[0] : ""),
      escapeCsv(lead.notes),
      escapeCsv(new Date(lead.createdAt).toISOString()),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leadflow-export-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
