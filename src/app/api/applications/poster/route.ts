import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const created = store.createApplication({
    company: payload.company ?? "Poster Company",
    role: payload.role ?? "Poster Role",
    contactEmail: payload.contactEmail ?? "poster@example.com",
    source: "poster-upload",
  });

  return NextResponse.json(created, { status: 201 });
}
