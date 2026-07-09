import { NextResponse } from "next/server";
import { store } from "@/lib/store";

interface RouteContext {
  params: Promise<{ campaignId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { campaignId } = await context.params;
  const campaign = store.updateCampaignStatus(Number(campaignId), "running");

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Retry started", campaign });
}
