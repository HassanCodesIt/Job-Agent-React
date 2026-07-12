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

const links = [
  ["Dashboard", "/"],
  ["Setup", "/setup"],
  ["Drafts", "/drafts"],
  ["Replies", "/replies"],
  ["Outreach", "/outreach"],
] as const;

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
      
      // Trigger a page refresh to update data everywhere
      router.refresh();
    } catch (err) {
      setSyncStatus("Sync failed");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 sm:px-8 justify-between">
        
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pr-4">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Job-Agent React
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {links.map(([label, href]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-3.5 py-2 transition-colors hover:text-white",
                    isActive ? "text-white" : "text-white/60"
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute inset-x-3.5 -bottom-[17px] h-[2px] bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          <div className="hidden md:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-48 focus:w-64 rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 h-9 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-teal-400", isSyncing && "animate-spin")} />
            <span>{syncStatus || "Sync"}</span>
          </button>

          {/* Main Apply Button */}
          <Link
            href="/apply"
            className="flex items-center gap-1 h-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 text-sm font-semibold text-white transition-all shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Apply</span>
          </Link>

          <button className="text-white/60 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          </button>
          
          <button className="text-white/60 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 overflow-hidden flex items-center justify-center">
            <span className="text-xs font-bold text-white">HA</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
