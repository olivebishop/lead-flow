import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseLeadInput, serializeLead, toPrismaData } from "@/lib/leads";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(leads.map(serializeLead));
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseLeadInput(body);

    if (!input.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: toPrismaData(input),
    });

    return NextResponse.json(serializeLead(lead), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
