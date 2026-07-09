"use client";

import { FormEvent, useState } from "react";

export default function SettingsPage() {
  const [message, setMessage] = useState("");

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Settings updated." : "Could not update settings.");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form onSubmit={update} className="grid gap-3 rounded-lg border bg-white p-4 md:max-w-xl">
        <textarea name="systemPrompt" placeholder="System prompt" rows={3} className="rounded border px-3 py-2" />
        <input name="groqApiKey" placeholder="Groq API key" className="rounded border px-3 py-2" />
        <input name="hfToken" placeholder="HuggingFace token" className="rounded border px-3 py-2" />
        <button className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Save settings</button>
      </form>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}
