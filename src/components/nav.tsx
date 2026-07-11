"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const links = [
  ["Dashboard", "/"],
  ["Setup", "/setup"],
  ["Apply", "/apply"],
  ["Drafts", "/drafts"],
  ["Replies", "/replies"],
  ["Outreach", "/outreach"],
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 sm:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 pr-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Job-Agent React
            </span>
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-1 mx-auto text-sm font-medium">
          {links.map(([label, href]) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 transition-colors hover:text-white",
                  isActive ? "text-white" : "text-white/60"
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute inset-x-4 -bottom-[17px] h-[2px] bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end gap-4">
          
          <div className="hidden md:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-64 rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <button className="text-white/60 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="text-white/60 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 overflow-hidden flex items-center justify-center">
            {/* Avatar Placeholder */}
            <span className="text-xs font-bold text-white">HA</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
