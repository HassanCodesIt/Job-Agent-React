import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const user = store.setUser(payload);

  if (!user.fullName || !user.email) {
    return NextResponse.json({ error: "fullName and email are required" }, { status: 400 });
  }

  return NextResponse.json(user);
}
