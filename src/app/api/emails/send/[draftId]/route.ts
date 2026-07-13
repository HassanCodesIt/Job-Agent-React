import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { sendOutreachEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { draftId } = await context.params;
    const result = await sendOutreachEmail(Number(draftId));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Emails Send API error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email." }, { status: 400 });
  }
}
