import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseLeadInput, serializeLead, toPrismaData } from "@/lib/leads";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(serializeLead(lead));
  } catch {
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = parseLeadInput(body);

    if ("name" in body && !input.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data = toPrismaData({
      name: input.name || existing.name,
      company: "company" in body ? input.company : existing.company,
      contact: "contact" in body ? input.contact : existing.contact,
      channel: "channel" in body ? input.channel : (existing.channel as typeof input.channel),
      status: "status" in body ? input.status : (existing.status as typeof input.status),
      value: "value" in body ? input.value : existing.value,
      followup: "followup" in body ? input.followup : existing.followup?.toISOString() ?? null,
      notes: "notes" in body ? input.notes : existing.notes,
    });

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json(serializeLead(lead));
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
