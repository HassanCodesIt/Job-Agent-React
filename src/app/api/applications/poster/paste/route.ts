import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const created = store.createApplication({
    company: payload.company ?? "Pasted Poster Company",
    role: payload.role ?? "Pasted Poster Role",
    contactEmail: payload.contactEmail ?? "paste@example.com",
    source: "poster-paste",
  });

  return NextResponse.json(created, { status: 201 });
}
