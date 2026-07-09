import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const created = store.createApplication({ ...payload, source: "job-url" });
  return NextResponse.json(created, { status: 201 });
}
