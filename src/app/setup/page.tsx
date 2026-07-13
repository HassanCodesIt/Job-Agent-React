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
    gmailAppPassword: ""
  });

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Fetch current user details on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/user");
        if (response.status === 404) {
          router.push("/login");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setProfile({
            fullName: data.fullName || "",
            title: data.title || "",
            email: data.email || "",
            phone: data.phone || "",
            skills: data.skills || "",
            summary: data.summary || "",
            projects: data.projects || "",
            gmailAddress: data.gmailAddress || "",
            gmailAppPassword: data.gmailAppPassword || ""
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }
    loadUser();
  }, []);

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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (response.ok) {
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
                <Mail className="h-5 w-5 text-zinc-300" />
                <h3 className="text-lg font-semibold text-white">Email Sending Credentials</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-5">Required for the agent to send outreach emails on your behalf.</p>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Gmail Address</label>
                  <input name="gmailAddress" type="email" placeholder="agent@gmail.com" value={profile.gmailAddress} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">App Password</label>
                  <input name="gmailAppPassword" type="password" placeholder="••••••••••••••••" value={profile.gmailAppPassword} onChange={handleInputChange} className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
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
