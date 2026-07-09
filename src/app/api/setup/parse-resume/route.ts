import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    fullName: "Parsed Candidate",
    email: "candidate@example.com",
    title: "Software Engineer",
    skills: "React, TypeScript, Next.js",
    summary: "Resume parsing placeholder that mirrors JOB-Agent setup flow.",
  });
}
