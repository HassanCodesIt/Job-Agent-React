import { store } from "@/lib/store";

export default function OutreachPage() {
  const campaigns = store.listCampaigns();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Outreach Campaigns</h1>
      <p className="text-sm text-slate-600">Start/pause/resume/retry via /api/campaigns/* routes.</p>
      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="rounded-lg border bg-white p-4">
            <h2 className="font-medium">{campaign.name}</h2>
            <p className="text-sm text-slate-600">
              Status: {campaign.status} · Sent: {campaign.sent} / {campaign.total}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
