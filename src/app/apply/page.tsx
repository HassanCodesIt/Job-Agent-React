"use client";

import { FormEvent, useState } from "react";

export default function ApplyPage() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/applications/job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: formData.get("company"),
        role: formData.get("role"),
        contactEmail: formData.get("contactEmail"),
      }),
    });

    setMessage(response.ok ? "Application intake created with draft." : "Failed to create application.");
    event.currentTarget.reset();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Application Intake</h1>
      <p className="text-sm text-slate-600">Use job URL/poster/text endpoints via API; this form uses the job endpoint.</p>
      <form onSubmit={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:max-w-xl">
        <input name="company" required placeholder="Company" className="rounded border px-3 py-2" />
        <input name="role" required placeholder="Role" className="rounded border px-3 py-2" />
        <input name="contactEmail" required type="email" placeholder="Contact email" className="rounded border px-3 py-2" />
        <button className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Generate draft</button>
      </form>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}
