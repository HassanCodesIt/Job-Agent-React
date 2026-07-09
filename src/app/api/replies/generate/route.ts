import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const applicationId = Number(payload.applicationId);

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
  }

  const reply = store.addReply(applicationId, payload.message ?? "Thanks for reaching out. I am interested in next steps.");
  return NextResponse.json(reply, { status: 201 });
}
