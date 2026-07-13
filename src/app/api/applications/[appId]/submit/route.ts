import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { sendOutreachEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { appId } = await context.params;
    const draft = store.getDraftByApplication(Number(appId));
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const result = await sendOutreachEmail(draft.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Submit API error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email outreach." }, { status: 400 });
  }
}
