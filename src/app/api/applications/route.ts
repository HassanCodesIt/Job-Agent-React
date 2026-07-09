import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.listApplications());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const created = store.createApplication({ ...payload, source: payload.source ?? "text" });
  return NextResponse.json(created, { status: 201 });
}
