"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Bot, Sparkles, Sliders, Shield } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PreferencesPage() {
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("concise");
  const [focus, setFocus] = useState("impact");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20 px-4">
      
      <header className="flex items-center justify-between mb-8 mt-4">
        <div className="flex flex-col gap-1">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white transition-colors w-fit group"
          >
            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="h-3 w-3" />
            </div>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <Bot className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white">AI Preferences</h1>
          </div>
        </div>
        
        <button className="flex items-center gap-2 h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </header>

      <div className="space-y-6">
        
        {/* Tone Configuration */}
        <section className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Communication Tone
            </h2>
            <p className="text-white/60 mb-6 max-w-xl text-sm">
              Adjust how the AI Agent writes your outreach emails. You can override these per-email later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "professional", label: "Professional", desc: "Formal, respectful, and direct." },
                { id: "casual", label: "Casual & Friendly", desc: "Warm, enthusiastic, and approachable." },
                { id: "confident", label: "Confident & Assertive", desc: "Bold, emphasizing high impact and value." }
              ].map(t => (
                <div 
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all",
                    tone === t.id 
                      ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                      : "bg-black/20 border-white/5 hover:bg-white/5"
                  )}
                >
                  <h3 className={cn("font-bold mb-1", tone === t.id ? "text-emerald-400" : "text-white")}>{t.label}</h3>
                  <p className="text-xs text-white/50">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email Structure */}
        <section className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Email Structure</h2>
          
          <div className="space-y-8">
            <div>
              <label className="text-sm font-bold text-white/80 block mb-3">Preferred Length</label>
              <div className="flex gap-4">
                {["Concise (under 100 words)", "Standard (100-200 words)", "Detailed (200+ words)"].map((l, i) => {
                  const val = ["concise", "standard", "detailed"][i];
                  return (
                    <button 
                      key={val}
                      onClick={() => setLength(val)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        length === val 
                          ? "bg-emerald-500 text-black border-emerald-500" 
                          : "bg-black/40 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                      )}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-white/80 block mb-3">Primary Focus Area</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "impact", label: "Business Impact", desc: "Highlight ROI, metrics, and business value delivered." },
                  { id: "technical", label: "Technical Depth", desc: "Focus on technologies, architecture, and engineering challenges." },
                  { id: "leadership", label: "Leadership & Strategy", desc: "Emphasize team leading, mentoring, and strategic vision." },
                  { id: "adaptability", label: "Adaptability & Speed", desc: "Focus on quick learning, shipping fast, and agility." }
                ].map(f => (
                  <div 
                    key={f.id}
                    onClick={() => setFocus(f.id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                      focus === f.id ? "bg-white/10 border-emerald-500/50" : "bg-black/40 border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5", focus === f.id ? "border-emerald-500" : "border-white/20")}>
                      {focus === f.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{f.label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global System Prompt */}
        <section className="glass-panel rounded-3xl p-8">
           <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Global Override Prompt
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl text-sm">
            Provide explicit, unchanging instructions for the AI. It will follow these rules for every draft generated.
          </p>

          <textarea 
            className="w-full h-32 rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner"
            placeholder="e.g. Always mention that I am based in New York and looking for remote roles. Never use the phrase 'I hope this email finds you well'."
          />
        </section>
      </div>
    </div>
  );
}
