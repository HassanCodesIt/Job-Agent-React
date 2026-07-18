"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings, Search, RefreshCw, Plus } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data = await response.json();
      setSyncStatus(data.message || "Inbox sync completed");
      setTimeout(() => setSyncStatus(null), 3000);
      router.refresh();
    } catch (err) {
      setSyncStatus("Sync failed");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  }

  if (pathname === "/login") return null;

  // Generate breadcrumb
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
    : "Dashboard";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 sm:px-8 justify-between w-full">
        
        {/* Left Section: Breadcrumbs */}
        <div className="flex items-center gap-2">
           <span className="text-white/40 text-sm font-medium">Job Agent</span>
           <span className="text-white/40 text-sm">/</span>
           <span className="text-white text-sm font-medium">{breadcrumb}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          <div className="hidden md:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <input
              type="text"
              placeholder="Search (Cmd+K)"
              className="h-9 w-48 focus:w-64 rounded-md border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="hidden sm:flex items-center gap-1.5 h-9 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-emerald-400", isSyncing && "animate-spin")} />
            <span>{syncStatus || "Sync Gmail"}</span>
          </button>

          {/* Main Apply Button */}
          <Link
            href="/apply"
            className="flex items-center gap-2 h-9 rounded-md bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 px-4 text-sm font-semibold text-[#09090B] transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </Link>

          <button className="text-white/60 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </button>

          <Link href="/preferences" className="text-white/60 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </nav>
  );
}
