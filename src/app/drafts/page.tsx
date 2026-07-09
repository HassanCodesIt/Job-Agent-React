import Link from "next/link";
import { store } from "@/lib/store";

export default function DraftsPage() {
  const drafts = store.listDrafts();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Drafts</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft.id} className="border-t">
                <td className="px-3 py-2">#{draft.id}</td>
                <td className="px-3 py-2">{draft.subject}</td>
                <td className="px-3 py-2">{draft.sent ? "Sent" : "Pending"}</td>
                <td className="px-3 py-2">
                  <Link className="text-blue-700 underline" href={`/replies/${draft.applicationId}`}>
                    Open reply editor
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
