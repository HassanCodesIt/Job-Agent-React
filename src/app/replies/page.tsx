import Link from "next/link";
import { store } from "@/lib/store";

export default function RepliesPage() {
  const replies = store.listReplies();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Inbox Replies</h1>
      <p className="text-sm text-slate-600">Sync endpoint: POST /api/sync</p>
      {replies.length === 0 ? (
        <p className="rounded border bg-white p-4 text-sm text-slate-600">No replies yet.</p>
      ) : (
        <ul className="space-y-2">
          {replies.map((reply) => (
            <li key={reply.id} className="rounded border bg-white p-4">
              <p className="font-medium">{reply.classification}</p>
              <p className="text-sm text-slate-600">{reply.message}</p>
              <Link className="text-blue-700 underline" href={`/replies/${reply.applicationId}`}>
                Open editor
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
