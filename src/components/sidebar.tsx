"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, Archive, BarChart2, LifeBuoy } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sideLinks = [
  { label: "Sent", href: "/sent", icon: Send },
  { label: "Archive", href: "/archive", icon: Archive },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Support", href: "/support", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#09090B] flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden md:flex">
      {/* Profile Section */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-gradient-to-br from-teal-400 to-blue-500 p-0.5">
            <div className="h-full w-full bg-[#09090B] rounded-[2px] flex items-center justify-center">
               <span className="text-teal-400 font-bold text-xs">AA</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Agent Alpha</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
              <span className="text-xs text-teal-400 font-medium">Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1">
        {sideLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                isActive 
                  ? "text-white bg-white/5" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Upgrade Button */}
      <div className="p-4">
        <button className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}
