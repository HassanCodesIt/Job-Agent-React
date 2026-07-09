import { NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { draftId } = await context.params;
  const draft = store.sendDraft(Number(draftId));

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Email sent (simulated)", draft });
}
