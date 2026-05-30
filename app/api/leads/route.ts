import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-error";
import { parseLeadInput, serializeLead, toPrismaData } from "@/lib/leads";

export const runtime = "nodejs";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(leads.map(serializeLead));
  } catch (error) {
    return apiError(error, "Failed to fetch leads");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseLeadInput(body);

    if (!input.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const now = new Date();
    const lead = await prisma.lead.create({
      data: {
        ...toPrismaData(input),
        createdAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json(serializeLead(lead), { status: 201 });
  } catch (error) {
    return apiError(error, "Failed to create lead");
  }
}
