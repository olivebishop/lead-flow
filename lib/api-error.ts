import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback: string) {
  console.error(fallback, error);

  const message =
    error instanceof Error ? error.message : fallback;

  return NextResponse.json({ error: message }, { status: 500 });
}
