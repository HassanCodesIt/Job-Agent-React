"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  FileText
} from "lucide-react";

interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function ApplyPage() {
  const [jobText, setJobText] = useState("");
  const [oneTimeInstructions, setOneTimeInstructions] = useState("");
  const [drafts, setDrafts] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function fetchRecentDrafts() {
    try {
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        // Show only the drafted (unsent) applications
        const draftedApps = data.filter((app: JobApplication) => app.status === "drafted");
        setDrafts(draftedApps);
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    }
  }

  useEffect(() => {
    fetchRecentDrafts();
  }, []);

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleProcessJob(e: React.FormEvent) {
    e.preventDefault();
    if (!jobText.trim()) {
      showMessage("Please paste job details first.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/applications/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, oneTimeInstructions }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Successfully processed job for "${data.application.company}" and generated email draft!`);
        setJobText("");
        setOneTimeInstructions("");
        fetchRecentDrafts();
      } else {
        showMessage(data.error || "Failed to process job description.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendNow(appId: number) {
    setSendingId(appId);
    try {
      const response = await fetch(`/api/applications/${appId}/submit`, {
        method: "POST",
      });

      if (response.ok) {
        showMessage("Application email sent successfully!");
        fetchRecentDrafts();
      } else {
        showMessage("Failed to send email.", "error");
      }
    } catch (err) {
      showMessage("Error sending email.", "error");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation Header */}
      <header className="flex flex-col gap-2">
        <Link 
          href="/" 
          className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Launch Application</h1>
      </header>

      {/* Notification Banner */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          message.type === "success" 
            ? "bg-teal-500/10 border-teal-500/25 text-teal-400" 
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Paste Form */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleProcessJob} className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-card-border pb-4">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <h2 className="text-xl font-semibold text-white">Quick Start: Paste Job Details</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Fastest way! Simply copy-paste the raw text from any job application or LinkedIn post.
              </label>
              <textarea 
                className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                rows={10} 
                placeholder="Paste job details, requirements, and contact info here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                One-Time Email Instructions (Optional)
              </label>
              <textarea 
                className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                rows={2} 
                placeholder="e.g. make this email warmer, briefly mention Python automation, keep it concise."
                value={oneTimeInstructions}
                onChange={(e) => setOneTimeInstructions(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is Processing Job & Writing Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-teal-300" />
                  <span>Process & Write Draft</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Side: Recent Drafts */}
        <div className="lg:col-span-5 rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-6">
          <div className="border-b border-card-border pb-4">
            <h2 className="text-xl font-semibold text-white">Recent Drafts</h2>
            <p className="text-xs text-zinc-400 mt-1">Pending approval and sending</p>
          </div>

          {drafts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mx-auto mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-white">No drafts ready</p>
              <p className="text-xs text-zinc-500 max-w-[240px] mx-auto">
                Paste a job description on the left to automatically compile custom drafts here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {drafts.map((draft) => (
                <div 
                  key={draft.id} 
                  className="p-4 rounded-lg border border-card-border bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{draft.company}</h3>
                    <p className="text-xs text-zinc-400 truncate">{draft.role}</p>
                    <Link 
                      href={`/replies/${draft.id}`}
                      className="text-[10px] text-primary hover:text-primary-hover font-medium underline block pt-1"
                    >
                      Review & Edit Draft
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => handleSendNow(draft.id)}
                    disabled={sendingId !== null}
                    className="flex items-center gap-1 rounded-full bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm shadow-purple-500/10 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sendingId === draft.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    <span>Send Now</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
