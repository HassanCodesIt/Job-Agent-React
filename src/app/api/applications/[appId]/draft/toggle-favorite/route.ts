import { NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { appId } = await context.params;
  const draft = store.toggleFavorite(Number(appId));
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json(draft);
}
