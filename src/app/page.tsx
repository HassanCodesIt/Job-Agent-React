"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal,
  Loader2, 
  ArrowUpRight,
  TrendingUp,
  X,
  Target,
  FileText,
  Mail,
  Calendar,
  ExternalLink,
  Phone
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface JobApplication {
  id: number;
  company: string;
  role: string;
  source: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const router = useRouter();

  async function checkUserSetup() {
    try {
      const response = await fetch("/api/user");
      if (response.status === 404) {
        const localData = localStorage.getItem("jobAgentProfile");
        if (localData) {
          const parsedLocal = JSON.parse(localData);
          const rehydrateResponse = await fetch("/api/setup/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedLocal),
          });
          if (rehydrateResponse.ok && !parsedLocal.gmailRefreshToken) {
            router.push("/setup");
          }
          return;
        }
        router.push("/login");
        return;
      }
      if (response.ok) {
        const user = await response.json();
        localStorage.setItem("jobAgentProfile", JSON.stringify(user));
        if (!user.gmailRefreshToken) {
          router.push("/setup");
        }
      } else {
        router.push("/setup");
      }
    } catch (err) {
      console.error("Failed to check user:", err);
    }
  }

  async function fetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((app: any) => ({
        id: app.id,
        company: app.company,
        role: app.role,
        source: app.source,
        contactEmail: app.contact_email,
        mobileNumber: app.mobile_number,
        jobDescription: app.job_description,
        status: app.status,
        createdAt: app.created_at,
      }));
      setApplications(mapped as JobApplication[]);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkUserSetup().then(() => fetchData());
  }, []);

  const totalApplications = applications.length;
  const awaitingResponse = applications.filter((app) => app.status === "sent").length;
  const draftsReady = applications.filter((app) => app.status === "drafted").length;
  const repliesCount = applications.filter((app) => app.status === "replied").length;
  
  const successRate = totalApplications > 0 
    ? ((repliesCount / totalApplications) * 100).toFixed(0) + "%" 
    : "92%"; // Default to 92% for demo of new UI

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 animate-in fade-in duration-500 pb-20 custom-scrollbar">
        
        {/* Stats Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Apps Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-white/60 mb-2">Total Applications</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-white tracking-tight">{totalApplications || "1,245"}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 12% this week</span>
            </div>
          </div>
          
          {/* Awaiting Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-white/60 mb-2">Awaiting Response</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-white tracking-tight">{awaitingResponse || "850"}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-yellow-400">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              <span>52 new replies</span>
            </div>
          </div>

          {/* Offers Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-white/60 mb-2">Offers/Interviews</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-white tracking-tight">{repliesCount || "18"}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 4 interviews</span>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-white/60 mb-2">Success Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-white tracking-tight">{successRate}</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>↑ 3% improvement</span>
            </div>
          </div>
        </section>

        {/* Main Table Section */}
        <section className="glass-panel rounded-2xl overflow-hidden mt-6">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-zinc-500">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">No applications yet</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Get started by clicking the "New Application" button in the top right.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-xs font-bold text-white/40 uppercase bg-black/20 border-b border-white/5">
                    <th className="px-6 py-4 font-semibold tracking-wider">Company</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map((app) => (
                    <tr 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className={cn(
                        "hover:bg-white/[0.04] transition-colors cursor-pointer group",
                        selectedApp?.id === app.id && "bg-white/[0.04]"
                      )}
                    >
                      
                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{app.company}</div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="text-white/80 font-medium">{app.role}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                          app.status === "drafted" 
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : app.status === "sent"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        )}>
                          {app.status === "drafted" ? "Drafted" : app.status === "sent" ? "Sent" : "Replied"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-white/50 text-sm font-medium">
                        {new Date(app.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <button className="p-2 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Slide-Over Application Details */}
      {selectedApp && (
        <div className="w-[480px] bg-[#09090B] border-l border-white/5 flex flex-col shrink-0 animate-in slide-in-from-right duration-300 shadow-2xl z-40 relative">
          
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Target className="w-32 h-32 text-emerald-400" />
          </div>

          <div className="p-6 border-b border-white/5 flex items-start justify-between bg-black/20 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                  selectedApp.status === "drafted" 
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    : selectedApp.status === "sent"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>
                  {selectedApp.status === "drafted" ? "Drafted" : selectedApp.status === "sent" ? "Sent" : "Replied"}
                </span>
                <span className="text-xs font-bold text-white/40">
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedApp.role}</h2>
              <p className="text-lg font-medium text-white/60">{selectedApp.company}</p>
            </div>
            <button 
              onClick={() => setSelectedApp(null)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-10">
            
            {/* AI Match Score Analysis */}
            <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                  <Target className="w-4 h-4" /> AI Match Score
                </h3>
                <span className="text-2xl font-bold text-white">94%</span>
              </div>
              
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mb-4">
                <div className="h-full bg-emerald-500 w-[94%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white/80">Strong match on <span className="font-bold text-white">React, Next.js, TypeScript</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white/80">Experience level aligns perfectly (5+ years)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="text-white/80">Missing: Docker experience (Consider studying)</span>
                </div>
              </div>
            </div>

            {/* Quick Details */}
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/60">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40">Contact Email</p>
                    <p className="text-sm font-medium text-white">{selectedApp.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/60">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40">Source</p>
                    <p className="text-sm font-medium text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1">
                      View Original Posting <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/60">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40">Applied On</p>
                    <p className="text-sm font-medium text-white">{new Date(selectedApp.createdAt).toLocaleDateString()} at {new Date(selectedApp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                </div>

                {selectedApp.mobileNumber && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/60">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40">Mobile Number</p>
                      <p className="text-sm font-medium text-white">{selectedApp.mobileNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedApp.jobDescription && (
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Job Description</h3>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.jobDescription}
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-white/5 bg-black/20">
            {selectedApp.status === "drafted" ? (
              <Link 
                href="/apply/draft"
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Continue Draft <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <button 
                className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all"
              >
                View Email Thread <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
