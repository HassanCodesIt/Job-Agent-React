"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";

export default function ApplyPage() {
  const [jobText, setJobText] = useState("");
  const [oneTimeInstructions, setOneTimeInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
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
            if (rehydrateResponse.ok) {
              if (!parsedLocal.gmailRefreshToken) {
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

    try {
      const response = await fetch("/api/applications/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, oneTimeInstructions }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save to session storage and navigate to draft page
        sessionStorage.setItem("jobAgentDraftData", JSON.stringify({
          application: data.application,
          draft: data.draft
        }));
        router.push("/apply/draft");
      } else {
        showMessage(data.error || "Failed to process job description.", "error");
        setLoading(false);
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
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

      {/* Paste Form */}
      <form onSubmit={handleProcessJob} className="rounded-xl border border-card-border bg-card p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-card-border pb-4">
          <Sparkles className="h-6 w-6 text-teal-400" />
          <h2 className="text-2xl font-semibold text-white">Paste Job Details</h2>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block">
            Raw Job Description
          </label>
          <textarea 
            className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
            rows={14} 
            placeholder="Paste job details, requirements, and contact info here..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block">
            Extra Instructions (Optional)
          </label>
          <textarea 
            className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
            rows={3} 
            placeholder="e.g. mention my Python skills, make it short"
            value={oneTimeInstructions}
            onChange={(e) => setOneTimeInstructions(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-4 text-base font-semibold text-white transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing Job Description...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-teal-300" />
              <span>Generate Email Draft</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
