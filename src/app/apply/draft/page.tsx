"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Save,
  Trash2,
  Check
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

const SEND_STEPS = [
  "Save Draft",
  "Prepare Data",
  "Connect Server",
  "Send Email",
  "Complete"
];

function DraftEditor() {
  const [currentApp, setCurrentApp] = useState<JobApplication | null>(null);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Progress Stepper State
  const [isSending, setIsSending] = useState(false);
  const [sendingStep, setSendingStep] = useState(0);

  const router = useRouter();

  useEffect(() => {
    // Load from sessionStorage
    const savedData = sessionStorage.getItem("jobAgentDraftData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.application && parsed.draft) {
          setCurrentApp(parsed.application);
          setCurrentDraft(parsed.draft);
        } else {
          router.push("/apply");
        }
      } catch (err) {
        router.push("/apply");
      }
    } else {
      router.push("/apply");
    }
  }, [router]);

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
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
        sessionStorage.setItem("jobAgentDraftData", JSON.stringify({ application: currentApp, draft: currentDraft }));
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
    
    setIsSending(true);
    setSendingStep(1); // 1. Save Draft
    
    // Auto-save first
    await handleSaveDraft();
    
    setSendingStep(2); // 2. Prepare Data
    await new Promise(r => setTimeout(r, 600));

    setSendingStep(3); // 3. Connect Server
    await new Promise(r => setTimeout(r, 600));

    setSendingStep(4); // 4. Send Email
    setSendingId(currentApp.id);
    
    try {
      const response = await fetch(`/api/applications/${currentApp.id}/submit`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSendingStep(5); // 5. Complete
        await new Promise(r => setTimeout(r, 800)); // Show completion step briefly
        
        setIsSending(false);
        sessionStorage.removeItem("jobAgentDraftData");
        router.push("/apply/success");
      } else {
        setIsSending(false);
        showMessage(data.error || "Failed to send email.", "error");
      }
    } catch (err) {
      setIsSending(false);
      showMessage("Error sending email.", "error");
    } finally {
      setSendingId(null);
    }
  }

  function handleDiscard() {
    sessionStorage.removeItem("jobAgentDraftData");
    router.push("/apply");
  }

  if (!currentApp || !currentDraft) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <Link 
          href="/apply" 
          className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Paste Job</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Review & Send Draft</h1>
      </header>

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

      <div className="rounded-xl border border-card-border bg-card shadow-sm flex flex-col">
        <div className="p-6 border-b border-card-border bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Application Draft</h2>
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
              rows={16}
            />
          </div>
        </div>

        <div className="p-6 border-t border-card-border bg-white/[0.02] flex items-center justify-between gap-4">
          <button
            onClick={handleDiscard}
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
              disabled={savingId !== null || sendingId !== null || isSending}
              className="flex items-center gap-2 rounded-full bg-teal-500 hover:bg-teal-400 px-8 py-2.5 text-sm font-bold text-black transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
            >
              {(sendingId !== null || isSending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Send Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sending Progress Modal */}
      {isSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-card-border rounded-2xl p-10 max-w-3xl w-full shadow-2xl flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-12">Submitting Application</h3>
            
            <div className="w-full flex justify-between relative px-4">
              <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-zinc-800 -z-10" />
              <div 
                className="absolute top-6 left-[10%] h-[2px] bg-teal-500 transition-all duration-500 ease-in-out -z-10" 
                style={{ width: `${((sendingStep - 1) / (SEND_STEPS.length - 1)) * 80}%` }}
              />
              
              {SEND_STEPS.map((step, idx) => {
                const stepNumber = idx + 1;
                const isActive = sendingStep === stepNumber;
                const isPast = sendingStep > stepNumber;
                
                return (
                  <div key={step} className="flex flex-col items-center gap-4 relative z-10 w-24">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all duration-500
                      ${isActive ? 'border-teal-400 bg-teal-500/20 text-teal-400 scale-110 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 
                        isPast ? 'border-teal-500 bg-teal-500 text-black' : 'border-zinc-800 bg-card text-zinc-600'}
                    `}>
                      {isPast ? <Check className="w-6 h-6" /> : (isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : stepNumber)}
                    </div>
                    <span className={`text-sm font-medium text-center transition-colors duration-300 ${isActive ? 'text-teal-400' : isPast ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>}>
      <DraftEditor />
    </Suspense>
  );
}
