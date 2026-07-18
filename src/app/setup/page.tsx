"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Settings, Mail, Copy, Check, FileText, Upload } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState<"copy-paste" | "auto">("copy-paste");
  
  // Custom Meta Prompt Paste parser state
  const [aiJsonInput, setAiJsonInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);

  // Bind all form values to state so they are pre-populated and editable
  const [profile, setProfile] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    skills: "",
    summary: "",
    projects: "",
    gmailAddress: "",
    gmailRefreshToken: "",
    resumeFilename: "",
    resumeBase64: ""
  });

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Fetch current user details on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/user");
        if (response.status === 404) {
          // Attempt auto-rehydration from localStorage
          const localData = localStorage.getItem("jobAgentProfile");
          if (localData) {
            const parsedLocal = JSON.parse(localData);
            // Silently upload to server to rehydrate memory
            await fetch("/api/setup/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsedLocal),
            });
            // Update local state
            setProfile(prev => ({ ...prev, ...parsedLocal }));
            return;
          }
          
          router.push("/login");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          // Save to localStorage so it stays fresh
          localStorage.setItem("jobAgentProfile", JSON.stringify(data));
          
          setProfile({
            fullName: data.fullName || "",
            title: data.title || "",
            email: data.email || "",
            phone: data.phone || "",
            skills: data.skills || "",
            summary: data.summary || "",
            projects: data.projects || "",
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
  }, [router]);

  const metaPromptText = `Extract the following details from my attached resume and return it strictly as a JSON object (no markdown, no backticks, no introduction, only the raw JSON) with these exact keys:

{
  "fullName": "Your full name",
  "title": "Your job title (e.g. Senior Frontend Engineer)",
  "email": "Your email address",
  "phone": "Your phone number",
  "skills": "Technical skills (comma-separated)",
  "summary": "Short professional summary/bio",
  "projects": "Highlight 2-3 key projects you worked on"
}

Here is my resume:`;

  function copyMetaPrompt() {
    navigator.clipboard.writeText(metaPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAiJsonParse() {
    if (!aiJsonInput.trim()) {
      setMessage("Please paste the JSON block from ChatGPT/Claude first.");
      return;
    }

    try {
      // Find JSON block if it was wrapped in backticks or text
      let cleanedInput = aiJsonInput.trim();
      const jsonStart = cleanedInput.indexOf("{");
      const jsonEnd = cleanedInput.lastIndexOf("}");
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedInput = cleanedInput.slice(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanedInput);
      
      setProfile(prev => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        title: parsed.title || prev.title,
        email: sanitizeEmail(parsed.email) || prev.email,
        phone: sanitizePhone(parsed.phone) || prev.phone,
        skills: parsed.skills || prev.skills,
        summary: parsed.summary || prev.summary,
        projects: parsed.projects || prev.projects,
      }));

      setMessage("Form auto-filled from pasted JSON! Please review and click 'Save Profile'.");
      setAiJsonInput("");
    } catch (err) {
      setMessage("Failed to parse JSON. Please make sure the pasted text is a valid JSON object.");
    }
  }

  async function handleGenerateMetaPrompt() {
    if (!resumeText.trim()) {
      setMessage("Please paste your resume text first.");
      return;
    }
    
    setIsGenerating(true);
    setMessage("Extracting profile data from resume using server-side LLM...");
    
    try {
      const response = await fetch("/api/setup/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction failed");
      
      setProfile(prev => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        title: data.title || prev.title,
        email: sanitizeEmail(data.email) || prev.email,
        phone: sanitizePhone(data.phone) || prev.phone,
        skills: data.skills || prev.skills,
        summary: data.summary || prev.summary,
        projects: data.projects || prev.projects,
      }));

      setMessage("Profile details parsed successfully using LLaMA! Please review and click 'Save Profile'.");
    } catch (err: any) {
      setMessage(err.message || "Failed to extract data. Try the Copy-Paste Meta Prompt tab instead.");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Resume file is too large. Please upload a PDF under 2MB.");
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
      setMessage("Resume file attached successfully!");
    };
    reader.onerror = () => {
      setMessage("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (response.ok) {
      localStorage.setItem("jobAgentProfile", JSON.stringify(profile));
      setToast({ message: "Profile saved successfully! Redirecting...", type: "success" });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setToast({ message: "Failed to save profile.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === "success" 
            ? "bg-teal-500 text-black font-semibold" 
            : "bg-red-500 text-white font-semibold"
        }`}>
          {toast.type === "success" ? <Check className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Guided Setup</h1>
        <p className="text-zinc-400 text-base">Configure your AI agent by providing your professional details.</p>
        {message && !toast && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 text-primary-hover rounded-md text-sm font-medium">
            {message}
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Section A: AI-Assisted Fill / Meta Prompting */}
        <section className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-card-border pb-4">
            <Sparkles className="h-5 w-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">Extract Profile Details</h2>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#09090B] rounded-lg p-1 gap-1 mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab("copy-paste")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "copy-paste"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Copy-Paste Meta Prompt
            </button>
            <button
              onClick={() => setActiveTab("auto")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "auto"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Direct AI Parse (Groq)
            </button>
          </div>

          {activeTab === "copy-paste" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Step 1: Copy Prompt & Run on ChatGPT / Claude</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Click below to copy the prompt instructions, paste it into ChatGPT, Claude, or Gemini alongside your resume, and copy the JSON block returned.
                </p>
                <div className="relative rounded-lg border border-white/10 bg-[#09090B] p-4 font-mono text-xs text-zinc-300 mt-2 max-h-44 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{metaPromptText}</pre>
                  <button
                    onClick={copyMetaPrompt}
                    className="absolute top-2 right-2 p-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-white">Step 2: Paste LLM Response</h3>
                <textarea
                  className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  rows={6}
                  placeholder="Paste the extracted JSON block here..."
                  value={aiJsonInput}
                  onChange={(e) => setAiJsonInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAiJsonParse}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Parse & Auto-Fill Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste your raw resume text directly here, and our server will call the Groq model (Llama-3) to extract details directly. Requires <code>GROQ_API_KEY</code> on server.
              </p>
              
              <textarea 
                className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                rows={11} 
                placeholder="Paste your raw resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              
              <button 
                type="button"
                onClick={handleGenerateMetaPrompt}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 transition-all cursor-pointer"
              >
                <Settings className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? "Generating..." : "Direct Auto-Fill"}
              </button>
            </div>
          )}
        </section>

        {/* Section B: Profile Form */}
        <section className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Your Profile</h2>
          
          <form ref={formRef} onSubmit={saveProfile} className="space-y-5">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Full Name</label>
                <input name="fullName" required placeholder="Jane Doe" value={profile.fullName} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Job Title</label>
                <input name="title" placeholder="Senior Frontend Engineer" value={profile.title} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Contact Email</label>
                <input name="email" type="email" required placeholder="jane@example.com" value={profile.email} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Phone Number</label>
                <input name="phone" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Skills (Comma separated)</label>
              <textarea name="skills" placeholder="React, TypeScript, Tailwind CSS..." value={profile.skills} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none animate-none" rows={3} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Summary / Bio</label>
              <textarea name="summary" placeholder="A brief professional summary..." value={profile.summary} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none animate-none" rows={4} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Key Projects</label>
              <textarea name="projects" placeholder="Highlight 2-3 major projects..." value={profile.projects} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none animate-none" rows={3} />
            </div>

            <div className="pt-6 pb-2">
              <div className="h-px w-full bg-white/10 mb-6"></div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-zinc-300" />
                <h3 className="text-lg font-semibold text-white">Attach Your Resume (PDF)</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-5">This file will be automatically attached to your outreach emails.</p>
              
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-hover hover:file:bg-primary/30 cursor-pointer"
                />
                {profile.resumeFilename && (
                  <span className="text-xs font-medium text-teal-400 shrink-0 flex items-center gap-1">
                    <Check className="h-3 w-3" /> {profile.resumeFilename}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-6 pb-2">
              <div className="h-px w-full bg-white/10 mb-6"></div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-zinc-300" />
                <h3 className="text-lg font-semibold text-white">Email Sending Credentials</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-5">Required for the agent to send outreach emails on your behalf.</p>
              
                {/* Show Gmail address if connected, or OAuth button if not */}
                <div className="sm:col-span-2 space-y-4">
                  {profile.gmailRefreshToken ? (
                    <div className="flex items-center justify-between rounded-md border border-teal-500/30 bg-teal-500/10 p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">Gmail Connected</span>
                        <span className="text-xs text-zinc-400">{profile.gmailAddress || "Your account is authorized"}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setProfile(prev => ({ ...prev, gmailRefreshToken: "", gmailAddress: "" }));
                        }}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <a 
                        href="/api/auth/google/login"
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-white hover:bg-gray-100 text-black px-4 py-3 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Connect with Google</span>
                      </a>
                      <p className="text-xs text-zinc-500 text-center">
                        This uses the official Gmail API to securely send emails on your behalf.
                      </p>
                    </div>
                  )}
                </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-3 font-semibold text-white transition-all shadow-lg shadow-purple-500/20 cursor-pointer">
                Save Profile
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
