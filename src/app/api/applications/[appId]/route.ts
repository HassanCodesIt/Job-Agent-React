import { NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { appId } = await context.params;
  const app = store.getApplication(Number(appId));
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(app);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { appId } = await context.params;
  const deleted = store.deleteApplication(Number(appId));
  if (!deleted) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
