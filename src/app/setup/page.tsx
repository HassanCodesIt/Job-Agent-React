"use client";

import { FormEvent, useState } from "react";

export default function SetupPage() {
  const [message, setMessage] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Profile saved." : "Failed to save profile.");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">First-Time Setup</h1>
      <form onSubmit={saveProfile} className="grid gap-3 rounded-lg border bg-white p-4">
        <input name="fullName" required placeholder="Full name" className="rounded border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="rounded border px-3 py-2" />
        <input name="title" placeholder="Title" className="rounded border px-3 py-2" />
        <textarea name="skills" placeholder="Skills" className="rounded border px-3 py-2" rows={3} />
        <textarea name="summary" placeholder="Summary" className="rounded border px-3 py-2" rows={3} />
        <button className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Save setup</button>
      </form>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}
