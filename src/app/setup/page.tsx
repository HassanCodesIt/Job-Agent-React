"use client";

import { FormEvent, useState, useRef } from "react";

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
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">First-Time Setup</h1>
        <p className="text-slate-600 mb-4">Set up your profile manually, or let our AI auto-fill it from your resume.</p>
        {message && <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded">{message}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Section A: AI-Assisted Fill */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium mb-4">AI Auto-Fill (Optional)</h2>
          <p className="text-sm text-slate-600 mb-4">Paste your resume text here and we'll extract your details.</p>
          
          <textarea 
            className="w-full rounded border px-3 py-2 mb-4" 
            rows={8} 
            placeholder="Paste your full resume text..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          
          <button 
            type="button"
            onClick={handleGenerateMetaPrompt}
            disabled={isGenerating}
            className="w-full rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white disabled:opacity-50 transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate Meta Prompt"}
          </button>
          
          {extractedData && (
            <div className="mt-6 p-4 bg-slate-50 border rounded text-sm">
              <h3 className="font-semibold mb-2 text-slate-700">Extracted Preview:</h3>
              <pre className="whitespace-pre-wrap text-xs text-slate-600 overflow-x-auto">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
              <button
                type="button"
                onClick={applyToForm}
                className="mt-4 w-full rounded bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white transition-colors"
              >
                Apply to Form
              </button>
            </div>
          )}
        </div>

        {/* Section B: Profile Form */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium mb-4">Your Profile</h2>
          <form ref={formRef} onSubmit={saveProfile} className="space-y-4">
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <input name="fullName" required placeholder="John Doe" className="w-full rounded border px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Job Title</label>
                <input name="title" placeholder="Software Engineer" className="w-full rounded border px-3 py-2" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Contact Email</label>
                <input name="email" type="email" required placeholder="john@example.com" className="w-full rounded border px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <input name="phone" placeholder="+1 234 567 890" className="w-full rounded border px-3 py-2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Skills</label>
              <textarea name="skills" placeholder="React, Next.js, TypeScript..." className="w-full rounded border px-3 py-2" rows={2} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Summary / Bio</label>
              <textarea name="summary" placeholder="Experienced developer with..." className="w-full rounded border px-3 py-2" rows={3} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Key Projects</label>
              <textarea name="projects" placeholder="1. Job Agent React: Built a Next.js app..." className="w-full rounded border px-3 py-2" rows={3} />
            </div>

            <hr className="my-6 border-slate-200" />
            
            <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-1">Email Sending Credentials</h3>
              <p className="text-xs text-blue-700 mb-4">Required to send emails from your own Gmail account. Not shared with anyone.</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Gmail Address</label>
                  <input name="gmailAddress" type="email" placeholder="you@gmail.com" className="w-full rounded border px-3 py-2" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">App Password</label>
                  <input name="gmailAppPassword" type="password" placeholder="••••••••••••••••" className="w-full rounded border px-3 py-2" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full rounded bg-slate-900 hover:bg-slate-800 px-4 py-3 font-medium text-white transition-colors mt-2">
              Save Profile
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
