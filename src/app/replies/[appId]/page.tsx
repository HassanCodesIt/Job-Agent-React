import { store } from "@/lib/store";

interface ReplyEditorPageProps {
  params: Promise<{ appId: string }>;
}

export default async function ReplyEditorPage({ params }: ReplyEditorPageProps) {
  const { appId } = await params;
  const applicationId = Number(appId);
  const application = store.getApplication(applicationId);
  const draft = store.getDraftByApplication(applicationId);

  if (!application || !draft) {
    return <p className="rounded border bg-white p-4">Application not found.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Reply Editor</h1>
      <div className="rounded-lg border bg-white p-4">
        <p className="font-medium">{application.company} — {application.role}</p>
        <p className="mt-2 text-sm text-slate-600">{draft.body}</p>
      </div>
    </section>
  );
}
