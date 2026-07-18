"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Loader2, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  Save,
  Trash2,
  Check,
  Bot,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "ai", text: string}[]>([
    { role: "ai", text: "I've drafted the initial email based on your profile and the job description. How would you like to tweak it?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  function showNotification(text: string, type: "success" | "error" = "success") {
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
        showNotification("Draft saved successfully!");
        sessionStorage.setItem("jobAgentDraftData", JSON.stringify({ application: currentApp, draft: currentDraft }));
      } else {
        showNotification("Failed to save draft.", "error");
      }
    } catch (err) {
      showNotification("Error saving draft.", "error");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSendNow() {
    if (!currentDraft || !currentApp) return;
    
    setIsSending(true);
    setSendingStep(1);
    
    await handleSaveDraft();
    
    setSendingStep(2);
    await new Promise(r => setTimeout(r, 600));

    setSendingStep(3);
    await new Promise(r => setTimeout(r, 600));

    setSendingStep(4);
    setSendingId(currentApp.id);
    
    try {
      const response = await fetch(`/api/applications/${currentApp.id}/submit`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSendingStep(5);
        await new Promise(r => setTimeout(r, 800));
        
        setIsSending(false);
        sessionStorage.removeItem("jobAgentDraftData");
        setShowSuccessModal(true);
      } else {
        setIsSending(false);
        showNotification(data.error || "Failed to send email.", "error");
      }
    } catch (err) {
      setIsSending(false);
      showNotification("Error sending email.", "error");
    } finally {
      setSendingId(null);
    }
  }

  function handleDiscard() {
    sessionStorage.removeItem("jobAgentDraftData");
    router.push("/apply");
  }

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMessage.trim() || !currentDraft) return;

    const userMsg = chatMessage.trim();
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setChatMessage("");
    setIsChatLoading(true);

    // Mock AI response for now (would typically hit an API to rewrite the draft)
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: "ai", text: "Got it! I've updated the draft to reflect your changes." }]);
      setCurrentDraft({
        ...currentDraft,
        body: `// Updated Draft based on: "${userMsg}"\n\n` + currentDraft.body
      });
      setIsChatLoading(false);
    }, 1500);
  }

  if (!currentApp || !currentDraft) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex flex-col gap-1">
          <Link 
            href="/apply" 
            className="flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white transition-colors w-fit group"
          >
            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="h-3 w-3" />
            </div>
            <span>Back to Paste Job</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Review & Send Draft</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            className="h-11 px-5 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/60 hover:text-red-400 transition-all cursor-pointer font-semibold text-sm"
          >
            Discard
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={savingId !== null || sendingId !== null}
            className="flex items-center gap-2 h-11 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            {savingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Edits</span>
          </button>
          <button
            onClick={handleSendNow}
            disabled={savingId !== null || sendingId !== null || isSending}
            className="flex items-center gap-2 h-11 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {(sendingId !== null || isSending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Send Now</span>
          </button>
        </div>
      </header>

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

      {/* Split Screen Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Side: Editor */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10">
            <div>
              <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">To: {currentApp.company} Hiring Team</p>
              <h2 className="text-xl font-bold text-white">{currentApp.role}</h2>
            </div>
            <span className="text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full">
              Draft Mode
            </span>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar relative z-10">
            <div className="space-y-1.5 shrink-0">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Subject Line</label>
              <input
                type="text"
                value={currentDraft.subject}
                onChange={(e) => setCurrentDraft({ ...currentDraft, subject: e.target.value })}
                className="w-full h-12 rounded-xl border border-white/10 bg-black/50 px-4 text-sm font-medium text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Email Body</label>
              <textarea
                value={currentDraft.body}
                onChange={(e) => setCurrentDraft({ ...currentDraft, body: e.target.value })}
                className="w-full flex-1 rounded-xl border border-white/10 bg-black/50 p-6 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner custom-scrollbar leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Chatbot UI */}
        <div className="w-[400px] shrink-0 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-black/20 shrink-0">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Agent Assistant</h3>
              <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user" 
                    ? "bg-emerald-500 text-black font-medium shadow-[0_4px_14px_rgba(16,185,129,0.2)] rounded-tr-sm" 
                    : "bg-white/10 text-white border border-white/5 shadow-sm rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex w-full justify-start">
                <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-black/20 shrink-0 border-t border-white/5">
            <form onSubmit={handleChatSubmit} className="relative">
              <input
                type="text"
                placeholder="Tweak the draft... (e.g. 'Make it shorter')"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={isChatLoading}
                className="w-full h-12 rounded-xl border border-white/10 bg-black/50 pl-4 pr-12 text-sm text-white placeholder:text-white/40 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={isChatLoading || !chatMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Sending Progress Modal */}
      {isSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="glass-panel border border-white/10 rounded-3xl p-12 max-w-3xl w-full shadow-2xl flex flex-col items-center">
            <h3 className="text-3xl font-bold text-white mb-16 tracking-tight">Submitting Application</h3>
            
            <div className="w-full flex justify-between relative px-4">
              <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-white/10 -z-10" />
              <div 
                className="absolute top-6 left-[10%] h-[2px] bg-emerald-500 transition-all duration-500 ease-in-out -z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${((sendingStep - 1) / (SEND_STEPS.length - 1)) * 80}%` }}
              />
              
              {SEND_STEPS.map((step, idx) => {
                const stepNumber = idx + 1;
                const isActive = sendingStep === stepNumber;
                const isPast = sendingStep > stepNumber;
                
                return (
                  <div key={step} className="flex flex-col items-center gap-4 relative z-10 w-24">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all duration-500",
                      isActive ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md" : 
                      isPast ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "border-white/10 bg-black/50 text-white/40"
                    )}>
                      {isPast ? <Check className="w-6 h-6" /> : (isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : stepNumber)}
                    </div>
                    <span className={cn(
                      "text-sm font-bold text-center transition-colors duration-300",
                      isActive ? "text-emerald-400" : isPast ? "text-white/80" : "text-white/30"
                    )}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel border border-white/10 rounded-3xl p-10 max-w-[420px] w-full shadow-2xl flex flex-col items-center text-center relative animate-in zoom-in-95 duration-300">
            {/* Fake Close Button to match modal aesthetic */}
            <Link 
              href="/"
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>

            {/* 3D Green Checkmark Icon */}
            <div className="h-24 w-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(16,185,129,0.4)] border-t border-emerald-300/50 transform -rotate-3 hover:rotate-0 transition-transform">
              <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Sent Successfully!</h3>
            
            <p className="text-white/60 mb-10 text-base leading-relaxed px-2">
              Your hyper-personalized application is on its way to the recruiter.
            </p>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
      <DraftEditor />
    </Suspense>
  );
}
