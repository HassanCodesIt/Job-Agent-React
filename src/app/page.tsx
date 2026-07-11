import Link from "next/link";
import { User, Link as LinkIcon, FileText, CornerUpLeft, Rocket } from "lucide-react";

const cards = [
  { 
    title: "Guided Setup", 
    description: "Configure profile or parse resume", 
    href: "/setup", 
    icon: User, 
    color: "text-zinc-400 group-hover:text-white" 
  },
  { 
    title: "Application Intake", 
    description: "Submit jobs from URL or text", 
    href: "/apply", 
    icon: LinkIcon, 
    color: "text-teal-400 group-hover:text-teal-300" 
  },
  { 
    title: "Drafts", 
    description: "Review and regenerate outreach drafts", 
    href: "/drafts", 
    icon: FileText, 
    color: "text-purple-400 group-hover:text-purple-300" 
  },
  { 
    title: "Replies", 
    description: "Track replies and generate responses", 
    href: "/replies", 
    icon: CornerUpLeft, 
    color: "text-zinc-400 group-hover:text-white" 
  },
  { 
    title: "Outreach Campaigns", 
    description: "Start and monitor campaign runs", 
    href: "/outreach", 
    icon: Rocket, 
    color: "text-blue-400 group-hover:text-blue-300",
    glow: "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">JOB-Agent Command Center</h1>
        <p className="text-zinc-400 text-base">Your AI-powered application and outreach nerve center.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link 
              key={card.href} 
              href={card.href} 
              className="group relative rounded-xl border border-card-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 flex flex-col justify-between min-h-[160px]"
            >
              <div className={`h-10 w-10 rounded-lg border border-white/10 flex items-center justify-center mb-4 transition-colors ${card.glow || 'bg-white/5 group-hover:bg-white/10'}`}>
                <Icon className={`h-5 w-5 ${card.color} transition-colors`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{card.title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
