"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Settings, Mail, FileText, User, ChevronRight, Eye, EyeOff, Upload, ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function sanitizeEmail(text: string | undefined): string {
  if (!text) return "";
  const match = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  return match ? match[1] : text;
}

function sanitizePhone(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/[^\d\+\-\(\)\s]/g, '').trim();
}

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [showGroq, setShowGroq] = useState(false);
  const [showHF, setShowHF] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    skills: "",
    summary: "",
    projects: "",
    systemPrompt: "Always write in a highly enthusiastic and professional tone. Keep it concise.",
    groqApiKey: "",
    hfToken: "",
    gmailAddress: "",
    gmailRefreshToken: "",
    resumeFilename: "",
    resumeBase64: ""
  });

  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/user");
        if (response.status === 404) {
          const localData = localStorage.getItem("jobAgentProfile");
          if (localData) {
            const parsedLocal = JSON.parse(localData);
            await fetch("/api/setup/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsedLocal),
            });
            setProfile(prev => ({ ...prev, ...parsedLocal }));
          }
          return;
        }
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("jobAgentProfile", JSON.stringify(data));
          
          setProfile({
            fullName: data.fullName || "",
            title: data.title || "",
            email: data.email || "",
            phone: data.phone || "",
            skills: data.skills || "",
            summary: data.summary || "",
            projects: data.projects || "",
            systemPrompt: data.systemPrompt || "Always write in a highly enthusiastic and professional tone. Keep it concise.",
            groqApiKey: data.groqApiKey || "",
            hfToken: data.hfToken || "",
            gmailAddress: data.gmailAddress || "",
            gmailRefreshToken: data.gmailRefreshToken || "",
            resumeFilename: data.resumeFilename || "",
            resumeBase64: data.resumeBase64 || ""
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }
    loadUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "File too large. Please use a PDF under 2MB.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile(prev => ({ 
        ...prev, 
        resumeFilename: file.name,
        resumeBase64: base64
      }));
      setToast({ message: "Resume uploaded successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  async function saveProfile(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    const response = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (response.ok) {
      localStorage.setItem("jobAgentProfile", JSON.stringify(profile));
      setToast({ message: "Profile Configured Successfully!", type: "success" });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setToast({ message: "Failed to save profile.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  }

  const steps = [
    { id: 1, name: "Account Info" },
    { id: 2, name: "Preferences" },
    { id: 3, name: "Integrations" }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-20 mt-4">
      
      {/* Floating Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-8 fade-in duration-300 border",
          toast.type === "success" 
            ? "bg-[#09090B] border-emerald-500/50 text-emerald-400" 
            : "bg-[#09090B] border-red-500/50 text-red-400"
        )}>
          {toast.type === "success" ? <Check className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Job Agent AI Setup</h1>
        <p className="text-zinc-400 text-sm">Configure your agent's capabilities and identity.</p>
      </header>

      {/* Stepper UI */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <button 
              onClick={() => setStep(s.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer border",
                step === s.id 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 glow-border" 
                  : step > s.id 
                    ? "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    : "bg-transparent text-white/40 border-transparent hover:text-white/60"
              )}
            >
              Step {s.id}: {s.name}
            </button>
            {index < steps.length - 1 && (
              <div className="w-12 h-[2px] mx-2 rounded-full bg-white/10 overflow-hidden relative">
                 {step > s.id && <div className="absolute inset-0 bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="glass-panel rounded-2xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Step 1: Account Info */}
        <div className={cn("space-y-6 transition-all duration-500", step === 1 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Full Name</label>
              <input name="fullName" placeholder="Jane Doe" value={profile.fullName} onChange={handleInputChange} className="w-full h-11 rounded-lg border border-white/10 bg-black/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Job Title</label>
              <input name="title" placeholder="Senior AI Engineer" value={profile.title} onChange={handleInputChange} className="w-full h-11 rounded-lg border border-white/10 bg-black/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Email Address</label>
              <input name="email" type="email" placeholder="jane@example.com" value={profile.email} onChange={handleInputChange} className="w-full h-11 rounded-lg border border-white/10 bg-black/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Phone Number</label>
              <input name="phone" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={handleInputChange} className="w-full h-11 rounded-lg border border-white/10 bg-black/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Professional Summary</label>
            <textarea name="summary" placeholder="A brief professional bio..." value={profile.summary} onChange={handleInputChange} className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" rows={4} />
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 h-11 rounded-full bg-white hover:bg-zinc-200 px-6 text-sm font-semibold text-black transition-all cursor-pointer">
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step 2: Preferences / Resume */}
        <div className={cn("space-y-8 transition-all duration-500", step === 2 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Resume & Identity</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Upload Resume (PDF)</h3>
            <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl bg-black/20 hover:bg-emerald-500/5 transition-all cursor-pointer overflow-hidden">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-white/40 group-hover:text-emerald-400 mb-3 transition-colors" />
                <p className="mb-2 text-sm text-white/60"><span className="font-bold text-white">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-white/40">PDF (MAX. 2MB)</p>
              </div>
              {profile.resumeFilename && (
                <div className="absolute inset-0 bg-[#09090B]/90 backdrop-blur-sm flex items-center justify-center border-2 border-emerald-500/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <Check className="h-5 w-5" /> {profile.resumeFilename} attached
                  </div>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-white/60 tracking-wider uppercase">AI System Prompt (Agent Tone)</label>
            <textarea name="systemPrompt" placeholder="How should your agent sound?" value={profile.systemPrompt} onChange={handleInputChange} className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" rows={3} />
            <p className="text-xs text-white/40">This instructs the LLM on how to write your emails.</p>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="flex items-center h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 text-sm font-medium text-white transition-all cursor-pointer">
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 h-11 rounded-full bg-white hover:bg-zinc-200 px-6 text-sm font-semibold text-black transition-all cursor-pointer">
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step 3: Integrations */}
        <div className={cn("space-y-8 transition-all duration-500", step === 3 ? "block opacity-100" : "hidden opacity-0")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">API Keys & Integrations</h2>
          </div>

          {/* Gmail Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-black/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Gmail Integration</h3>
                  {profile.gmailRefreshToken ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-sm text-emerald-400 font-medium">Connected as {profile.gmailAddress}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 mt-1">Required for sending outreach</p>
                  )}
                </div>
              </div>
              
              {profile.gmailRefreshToken ? (
                <button onClick={() => setProfile(prev => ({...prev, gmailRefreshToken: "", gmailAddress: ""}))} className="h-10 px-5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold transition-colors cursor-pointer">
                  Disconnect
                </button>
              ) : (
                <a href="/api/auth/google/login" className="flex items-center justify-center h-10 px-6 rounded-lg bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-all cursor-pointer">
                  Connect Account
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-white">API Keys Setup</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">Groq API Key (Optional)</label>
              <div className="relative">
                <input name="groqApiKey" type={showGroq ? "text" : "password"} value={profile.groqApiKey} onChange={handleInputChange} placeholder="gsk_..." className="w-full h-11 rounded-lg border border-white/10 bg-black/50 pl-4 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono" />
                <button type="button" onClick={() => setShowGroq(!showGroq)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer">
                  {showGroq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 tracking-wider uppercase">HuggingFace Token (Optional)</label>
              <div className="relative">
                <input name="hfToken" type={showHF ? "text" : "password"} value={profile.hfToken} onChange={handleInputChange} placeholder="hf_..." className="w-full h-11 rounded-lg border border-white/10 bg-black/50 pl-4 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono" />
                <button type="button" onClick={() => setShowHF(!showHF)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer">
                  {showHF ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-8">
            <button onClick={() => setStep(2)} className="flex items-center h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 text-sm font-medium text-white transition-all cursor-pointer">
              Back
            </button>
            <button onClick={() => saveProfile()} className="flex items-center gap-2 h-11 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 px-8 text-sm font-bold text-[#09090B] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer">
              <Check className="h-4 w-4" /> Save & Complete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
