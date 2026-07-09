import { store } from "@/lib/store";

export default function SentPage() {
  const sent = store.listDrafts().filter((draft) => draft.sent);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Sent Emails</h1>
      {sent.length === 0 ? (
        <p className="rounded border bg-white p-4 text-sm text-slate-600">No sent messages yet.</p>
      ) : (
        <ul className="space-y-2">
          {sent.map((draft) => (
            <li key={draft.id} className="rounded border bg-white p-4">
              <p className="font-medium">{draft.subject}</p>
              <p className="text-sm text-slate-600">Draft #{draft.id}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
