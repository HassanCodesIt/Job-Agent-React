import Link from "next/link";

const cards = [
  { title: "Guided Setup", description: "Configure your profile or parse resume", href: "/setup" },
  { title: "Application Intake", description: "Submit jobs from URL/poster/text", href: "/apply" },
  { title: "Drafts", description: "Review and regenerate outreach drafts", href: "/drafts" },
  { title: "Replies", description: "Track replies and generate responses", href: "/replies" },
  { title: "Outreach Campaigns", description: "Start and monitor campaign runs", href: "/outreach" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">JOB-Agent Command Center (React)</h1>
        <p className="text-slate-600">Vercel-ready Next.js replication with matching workflows.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-lg border bg-white p-4 shadow-sm hover:border-slate-300">
            <h2 className="font-medium">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
