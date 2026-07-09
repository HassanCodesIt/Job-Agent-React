import { NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { draftId } = await context.params;
  const deleted = store.deleteDraft(Number(draftId));

  if (!deleted) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
