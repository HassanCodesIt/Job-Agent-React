"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, FileText, MessageSquare, Megaphone, LogOut } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sideLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Setup", href: "/setup", icon: Settings },
  { label: "Drafts", href: "/drafts", icon: FileText },
  { label: "Replies", href: "/replies", icon: MessageSquare },
  { label: "Campaigns", href: "/outreach", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#09090B] flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden md:flex">
      {/* Brand Section */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Job Agent <span className="text-emerald-400">AI</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {sideLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                isActive 
                  ? "text-emerald-400 bg-emerald-500/10 glow-border" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/80")} />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/10 overflow-hidden flex items-center justify-center">
              <span className="text-xs font-bold text-white">US</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">User</h3>
              <p className="text-xs text-white/50">Pro Plan</p>
            </div>
          </div>
          <LogOut className="h-4 w-4 text-white/40 group-hover:text-white/80" />
        </div>
      </div>
    </aside>
  );
}
