import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const user = store.getUser();
  if (!user) {
    return NextResponse.json({ error: "No profile found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const user = store.setUser(payload);
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  const user = store.setUser(payload);
  return NextResponse.json(user);
}
