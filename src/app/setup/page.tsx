"use client";

import { FormEvent, useState, useRef } from "react";
import { Sparkles, Settings, Mail } from "lucide-react";

export default function SetupPage() {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);

  const formRef = useRef<HTMLFormElement>(null);

  async function handleGenerateMetaPrompt() {
    if (!resumeText.trim()) {
      setMessage("Please paste your resume text first.");
      return;
    }
    
    setIsGenerating(true);
    setMessage("Extracting profile data from resume...");
    
    try {
      const response = await fetch("/api/setup/meta-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction failed");
      
      setExtractedData(data);
      setMessage("Profile data extracted successfully. Click 'Apply to Form' to populate fields.");
    } catch (err: any) {
      setMessage(err.message || "Failed to extract data");
    } finally {
      setIsGenerating(false);
    }
  }

  function applyToForm() {
    if (!extractedData || !formRef.current) return;
    
    const form = formRef.current;
    
    const fields = ["fullName", "email", "phone", "title", "skills", "summary", "projects"];
    fields.forEach(field => {
      if (extractedData[field]) {
        const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
        if (input) {
          input.value = extractedData[field];
        }
      }
    });
    
    setMessage("Form auto-filled!");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/setup/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Profile saved." : "Failed to save profile.");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Guided Setup</h1>
        <p className="text-zinc-400 text-base">Configure your AI agent by providing your professional details.</p>
        {message && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 text-primary-hover rounded-md text-sm font-medium">
            {message}
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Section A: AI-Assisted Fill */}
        <section className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">AI Auto-Fill</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Paste your resume text below to let the AI extract and populate your profile.
          </p>
          
          <textarea 
            className="w-full rounded-md border border-white/10 bg-[#09090B] px-4 py-3 mb-6 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
            rows={14} 
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          
          <button 
            type="button"
            onClick={handleGenerateMetaPrompt}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 transition-all"
          >
            <Settings className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate Meta Prompt"}
          </button>
          
          {extractedData && (
            <div className="mt-6 rounded-md border border-white/10 bg-[#09090B] p-4 text-sm font-mono overflow-hidden">
              <pre className="whitespace-pre-wrap text-xs text-teal-300">
                {JSON.stringify({ status: "success", extracted_data: extractedData }, null, 2)}
              </pre>
            </div>
          )}

          {extractedData && (
            <button
              type="button"
              onClick={applyToForm}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-3 text-sm font-medium text-white transition-all shadow-lg shadow-purple-500/20"
            >
              Apply to Form
            </button>
          )}
        </section>

        {/* Section B: Profile Form */}
        <section className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Your Profile</h2>
          
          <form ref={formRef} onSubmit={saveProfile} className="space-y-5">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Full Name</label>
                <input name="fullName" required placeholder="Jane Doe" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Job Title</label>
                <input name="title" placeholder="Senior Frontend Engineer" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Contact Email</label>
                <input name="email" type="email" required placeholder="jane@example.com" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Phone Number</label>
                <input name="phone" placeholder="+1 (555) 000-0000" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Skills (Comma separated)</label>
              <textarea name="skills" placeholder="React, TypeScript, Tailwind CSS..." className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" rows={3} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Summary / Bio</label>
              <textarea name="summary" placeholder="A brief professional summary..." className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" rows={4} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">Key Projects</label>
              <textarea name="projects" placeholder="Highlight 2-3 major projects..." className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none" rows={3} />
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
                  <input name="gmailAddress" type="email" placeholder="agent@gmail.com" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 tracking-wide uppercase">App Password</label>
                  <input name="gmailAppPassword" type="password" placeholder="••••••••••••••••" className="w-full rounded-md border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-3 font-semibold text-white transition-all shadow-lg shadow-purple-500/20">
                Save Profile
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
