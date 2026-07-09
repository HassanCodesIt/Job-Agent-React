import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const draft = store.regenerateDraft(Number(draftId), payload?.instruction);

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json(draft);
}
