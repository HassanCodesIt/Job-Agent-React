"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Send, 
  Trash2, 
  Loader2, 
  Plus, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  AlertCircle
} from "lucide-react";

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
  const [actionId, setActionId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  async function checkUserSetup() {
    try {
      const response = await fetch("/api/user");
      if (response.status === 404) {
        // Attempt auto-rehydration from localStorage
        const localData = localStorage.getItem("jobAgentProfile");
        if (localData) {
          const parsedLocal = JSON.parse(localData);
          // Silently upload to server to rehydrate memory
          const rehydrateResponse = await fetch("/api/setup/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedLocal),
          });
          if (rehydrateResponse.ok) {
            // Rehydration successful, check if they need setup
            if (!parsedLocal.gmailAppPassword) {
              router.push("/setup");
            }
            return;
          }
        }
        
        router.push("/login");
        return;
      }
      if (response.ok) {
        const user = await response.json();
        // Keep localStorage fresh
        localStorage.setItem("jobAgentProfile", JSON.stringify(user));
        
        if (!user.gmailAppPassword) {
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
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkUserSetup().then(() => fetchData());
  }, []);

  function showNotification(message: string, type: "success" | "error" = "success") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleSendDraft(appId: number) {
    setActionId(appId);
    try {
      const response = await fetch(`/api/applications/${appId}/submit`, {
        method: "POST"
      });
      if (response.ok) {
        setShowSuccessModal(true);
        fetchData();
      } else {
        showNotification("Failed to send application email.", "error");
      }
    } catch (err) {
      showNotification("Error sending application email.", "error");
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteApplication(appId: number) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    setActionId(appId);
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        showNotification("Application deleted.");
        fetchData();
      } else {
        showNotification("Failed to delete application.", "error");
      }
    } catch (err) {
      showNotification("Error deleting application.", "error");
    } finally {
      setActionId(null);
    }
  }

  // Calculate statistics
  const totalApplications = applications.length;
  const awaitingResponse = applications.filter((app) => app.status === "sent").length;
  const draftsReady = applications.filter((app) => app.status === "drafted").length;
  const repliesCount = applications.filter((app) => app.status === "replied").length;
  
  const successRate = totalApplications > 0 
    ? ((repliesCount / totalApplications) * 100).toFixed(1) + "%" 
    : "0.0%";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Command Center</h1>
          <p className="text-zinc-400 text-sm">Tracking and Automating your career growth</p>
        </div>
        
        <Link 
          href="/apply"
          className="sm:hidden flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Apply to a Job</span>
        </Link>
      </header>

      {/* Notifications banner */}
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          notification.type === "success" 
            ? "bg-teal-500/10 border-teal-500/25 text-teal-400" 
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Total Applications</p>
          <p className="text-4xl font-bold text-white">{totalApplications}</p>
        </div>
        
        {/* Card 2 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Awaiting Response</p>
          <p className="text-4xl font-bold text-amber-500">{awaitingResponse}</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Drafts Ready</p>
          <p className="text-4xl font-bold text-blue-500">{draftsReady}</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Success Rate</p>
          <p className="text-4xl font-bold text-teal-400">{successRate}</p>
        </div>
      </section>

      {/* Main Table Section */}
      <section className="rounded-xl border border-card-border bg-card overflow-hidden">
        <div className="p-6 border-b border-card-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Applications</h2>
          <span className="text-xs text-zinc-400 font-medium bg-white/5 px-2.5 py-1 rounded-full">
            {applications.length} Listed
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-zinc-500">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 mb-2">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No applications yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Get started by clicking the Apply button in the navigation to paste a job and generate a draft.
              </p>
            </div>
            <Link 
              href="/apply"
              className="mt-2 flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all cursor-pointer"
            >
              <span>Add Your First Application</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-white/[0.02] border-b border-card-border">
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* Company & Role */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{app.company}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{app.role}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === "drafted" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : app.status === "sent"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      }`}>
                        {app.status === "drafted" ? (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Drafted</span>
                          </>
                        ) : app.status === "sent" ? (
                          <>
                            <Clock className="h-3 w-3 animate-pulse" />
                            <span>Awaiting Response</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Replied</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Draft Link */}
                        <Link
                          href={`/replies/${app.id}`}
                          title="Open Draft / Reply Editor"
                          className="p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-zinc-400 hover:text-white transition-all"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>

                        {/* Send Email Action */}
                        {app.status === "drafted" && (
                          <button
                            onClick={() => handleSendDraft(app.id)}
                            disabled={actionId !== null}
                            title="Send outreach email"
                            className="p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-teal-400 hover:text-teal-300 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {actionId === app.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          disabled={actionId !== null}
                          title="Delete application"
                          className="p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-card-border rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Application Sent!</h3>
            <p className="text-zinc-400 mb-8">
              Your email outreach has been successfully sent to the hiring team.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
