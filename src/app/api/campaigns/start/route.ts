import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const campaign = store.createCampaign(payload.name ?? "Imported Sheet Campaign");
  return NextResponse.json(campaign, { status: 201 });
}
