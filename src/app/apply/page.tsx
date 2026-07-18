"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
      const localData = localStorage.getItem("jobAgentProfile");
      const userProfile = localData ? JSON.parse(localData) : null;

      const response = await fetch("/api/applications/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, oneTimeInstructions, userProfile }),
      });

      const data = await response.json();

      if (response.ok) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          showMessage("You must be logged in to save an application.", "error");
          setLoading(false);
          return;
        }

        const parsed = data.parsedResult;
        
        // Insert into Supabase
        const { data: appData, error: appError } = await supabase.from('applications').insert({
          user_id: session.user.id,
          company: parsed.company,
          role: parsed.role,
          contact_email: parsed.contactEmail,
          mobile_number: parsed.mobileNumber,
          job_description: jobText,
          source: 'text-pasted',
          status: 'drafted'
        }).select().single();

        if (appError) {
          console.error("Supabase app insert error:", appError);
          showMessage("Failed to save application to database.", "error");
          setLoading(false);
          return;
        }

        const { data: draftData, error: draftError } = await supabase.from('drafts').insert({
          application_id: appData.id,
          user_id: session.user.id,
          subject: parsed.subject,
          body: parsed.emailBody
        }).select().single();

        if (draftError) {
          console.error("Supabase draft insert error:", draftError);
          showMessage("Failed to save draft to database.", "error");
          setLoading(false);
          return;
        }

        const mappedApp = {
          id: appData.id,
          company: appData.company,
          role: appData.role,
          source: appData.source,
          contactEmail: appData.contact_email,
          mobileNumber: appData.mobile_number,
          jobDescription: appData.job_description,
          status: appData.status,
          createdAt: appData.created_at,
        };

        const mappedDraft = {
          id: draftData.id,
          applicationId: draftData.application_id,
          subject: draftData.subject,
          body: draftData.body
        };

        // Save to session storage and navigate to draft page
        sessionStorage.setItem("jobAgentDraftData", JSON.stringify({
          application: mappedApp,
          draft: mappedDraft
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto px-4 relative">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to Dashboard
        </Link>
      </div>

      {/* Notification Banner */}
      {message && (
        <div className={cn(
          "absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 font-medium text-sm",
          message.type === "success" 
            ? "bg-emerald-500 text-black" 
            : "bg-red-500 text-white"
        )}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full text-center space-y-4 mb-10 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-2">
          <Sparkles className="h-3 w-3" /> Step 1
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
          Drop the Job Details.
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Paste the job description below. Our AI will analyze the requirements and draft a hyper-personalized email instantly.
        </p>
      </div>

      {/* Paste Form */}
      <form onSubmit={handleProcessJob} className="w-full relative z-10 space-y-6">
        
        {/* Massive Input Area */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative">
            <textarea 
              className={cn(
                "w-full h-[280px] rounded-3xl border-2 border-white/10 bg-[#09090B]/90 backdrop-blur-xl p-8 text-lg text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:outline-none transition-all resize-none shadow-2xl custom-scrollbar",
                loading && "opacity-50 pointer-events-none"
              )}
              placeholder="Paste the raw job description, requirements, or URL here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              disabled={loading}
            />
            {/* Inner Sparkle Icon when empty */}
            {!jobText && (
              <div className="absolute bottom-8 right-8 text-white/10 pointer-events-none">
                <Sparkles className="h-12 w-12" />
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Extra Instructions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8">
          
          <div className="relative w-full sm:w-[350px]">
             <input 
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" 
              placeholder="Extra context? (e.g. emphasize my React skills)"
              value={oneTimeInstructions}
              onChange={(e) => setOneTimeInstructions(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !jobText.trim()}
            className={cn(
              "h-14 px-8 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] w-full sm:w-auto shrink-0",
              loading || !jobText.trim()
                ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/10"
                : "bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Extracting Requirements...</span>
              </>
            ) : (
              <>
                <span>Generate Draft</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
