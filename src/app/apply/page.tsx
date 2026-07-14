"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Save,
  Trash2
} from "lucide-react";

interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Draft {
  id: number;
  applicationId: number;
  subject: string;
  body: string;
}

export default function ApplyPage() {
  const [jobText, setJobText] = useState("");
  const [oneTimeInstructions, setOneTimeInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Current draft being edited/viewed
  const [currentApp, setCurrentApp] = useState<JobApplication | null>(null);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
    checkUserSetup();
  }, [router]);

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
    setCurrentApp(null);
    setCurrentDraft(null);

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
        
        setCurrentApp(data.application);
        setCurrentDraft(data.draft);
      } else {
        showMessage(data.error || "Failed to process job description.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!currentDraft) return;
    setSavingId(currentDraft.id);
    try {
      const response = await fetch(`/api/drafts/${currentDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentDraft.subject,
          body: currentDraft.body
        })
      });
      if (response.ok) {
        showMessage("Draft saved successfully!");
      } else {
        showMessage("Failed to save draft.", "error");
      }
    } catch (err) {
      showMessage("Error saving draft.", "error");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSendNow() {
    if (!currentDraft || !currentApp) return;
    
    // Auto-save first
    await handleSaveDraft();

    setSendingId(currentApp.id);
    try {
      const response = await fetch(`/api/applications/${currentApp.id}/submit`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        setCurrentApp(null);
        setCurrentDraft(null);
      } else {
        showMessage(data.error || "Failed to send email.", "error");
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
          className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-fit"
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
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleProcessJob} className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-card-border pb-4">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <h2 className="text-xl font-semibold text-white">1. Paste Job Details</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Raw Job Description
              </label>
              <textarea 
                className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                rows={12} 
                placeholder="Paste job details, requirements, and contact info here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Extra Instructions (Optional)
              </label>
              <textarea 
                className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                rows={2} 
                placeholder="e.g. mention my Python skills, make it short"
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-teal-300" />
                  <span>Generate Draft</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Draft Editor */}
        <div className="lg:col-span-7">
          {!currentDraft || !currentApp ? (
            <div className="rounded-xl border border-card-border bg-card p-12 text-center space-y-4 shadow-sm h-full flex flex-col justify-center items-center">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">No draft generated yet</p>
                <p className="text-sm text-zinc-500 max-w-sm mt-1">
                  Paste a job description on the left and click "Generate Draft" to write a personalized outreach email.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-card-border bg-card shadow-sm flex flex-col animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-card-border bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">2. Review & Send Draft</h2>
                  <span className="text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    Drafted
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white font-medium">To: {currentApp.company} Hiring Team</p>
                  <p className="text-xs text-zinc-400">Role: {currentApp.role}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={currentDraft.subject}
                    onChange={(e) => setCurrentDraft({ ...currentDraft, subject: e.target.value })}
                    className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm font-medium text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Email Body
                  </label>
                  <textarea
                    value={currentDraft.body}
                    onChange={(e) => setCurrentDraft({ ...currentDraft, body: e.target.value })}
                    className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                    rows={12}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-card-border bg-white/[0.02] flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setCurrentApp(null);
                    setCurrentDraft(null);
                  }}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                  title="Discard Draft"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className="flex gap-3 flex-1 justify-end">
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingId !== null || sendingId !== null}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {savingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save Edits</span>
                  </button>

                  <button
                    onClick={handleSendNow}
                    disabled={savingId !== null || sendingId !== null}
                    className="flex items-center gap-2 rounded-full bg-teal-500 hover:bg-teal-400 px-8 py-2.5 text-sm font-bold text-black transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {sendingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Send Application</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

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
