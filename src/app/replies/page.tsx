"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Inbox, 
  Search, 
  MoreHorizontal, 
  Reply as ReplyIcon, 
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ReplyData = {
  id: number;
  company: string;
  role: string;
  sender: string;
  avatar: string;
  time: string;
  snippet: string;
  fullMessage: string;
  classification: "Positive" | "Neutral" | "Negative";
  unread: boolean;
};

// Mock data to show off the premium UI
const MOCK_REPLIES: ReplyData[] = [
  {
    id: 1,
    company: "Google",
    role: "Senior React Engineer",
    sender: "Sarah Jenkins",
    avatar: "S",
    time: "10:42 AM",
    snippet: "We loved your profile! Are you available for a quick chat tomorrow?",
    fullMessage: "Hi there,\n\nThanks for reaching out! We reviewed your profile and really liked your background in React and Next.js. We are currently looking for someone with exactly your skill set to join our core frontend team.\n\nAre you available for a 30-minute introductory call tomorrow between 1 PM and 4 PM PST?\n\nBest,\nSarah Jenkins\nTechnical Recruiter, Google",
    classification: "Positive",
    unread: true,
  },
  {
    id: 2,
    company: "Vercel",
    role: "Frontend Developer",
    sender: "Mark Robinson",
    avatar: "M",
    time: "Yesterday",
    snippet: "Thanks for applying. We will keep your resume on file.",
    fullMessage: "Hello,\n\nThank you for taking the time to apply for the Frontend Developer position at Vercel. We appreciate your interest in joining our team.\n\nWhile your qualifications are impressive, we have decided to move forward with other candidates whose experience better aligns with our current needs.\n\nWe will keep your resume on file for future opportunities.\n\nBest regards,\nThe Vercel Talent Team",
    classification: "Negative",
    unread: false,
  },
  {
    id: 3,
    company: "Stripe",
    role: "UI Engineer",
    sender: "Alex Chen",
    avatar: "A",
    time: "Oct 12",
    snippet: "Can you provide some more details on your past open source work?",
    fullMessage: "Hi,\n\nThanks for reaching out regarding the UI Engineer role.\n\nBefore we move forward, the hiring manager would love to see some more details about your contributions to open-source projects. Do you have a list of PRs or a GitHub portfolio you can share?\n\nLooking forward to hearing from you.\n\nThanks,\nAlex Chen\nRecruiter",
    classification: "Neutral",
    unread: false,
  }
];

export default function RepliesPage() {
  const [replies, setReplies] = useState<ReplyData[]>(MOCK_REPLIES);
  const [selectedId, setSelectedId] = useState<number>(MOCK_REPLIES[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedReply = replies.find(r => r.id === selectedId);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setReplies(replies.map(r => r.id === id ? { ...r, unread: false } : r));
  };

  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case "Positive": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Negative": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getBadgeIcon = (classification: string) => {
    switch (classification) {
      case "Positive": return <CheckCircle2 className="w-3 h-3" />;
      case "Negative": return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredReplies = replies.filter(r => 
    r.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col px-4 pb-4">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-6 shrink-0 pt-4">
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
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Smart Inbox</h1>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Sorted
            </span>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search replies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
          />
        </div>
      </header>

      {/* Two Pane Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Pane: Inbox List */}
        <div className="w-[450px] shrink-0 glass-panel rounded-3xl flex flex-col overflow-hidden relative">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Inbox className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold">All Messages</h2>
            </div>
            <span className="text-xs font-medium text-white/40">{filteredReplies.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredReplies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                <Inbox className="w-12 h-12 mb-4 opacity-20" />
                <p>No messages found matching your search.</p>
              </div>
            ) : (
              filteredReplies.map((reply) => (
                <div 
                  key={reply.id}
                  onClick={() => handleSelect(reply.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl cursor-pointer transition-all border",
                    selectedId === reply.id 
                      ? "bg-white/10 border-white/20 shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        selectedId === reply.id ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/10 text-white"
                      )}>
                        {reply.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-sm font-bold truncate", reply.unread ? "text-white" : "text-white/80")}>
                          {reply.company}
                        </p>
                        <p className="text-xs text-white/60 truncate">{reply.sender}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-white/40 shrink-0 mt-1">{reply.time}</span>
                  </div>
                  
                  <div className="pl-13">
                    <p className={cn(
                      "text-sm line-clamp-2 mb-3",
                      reply.unread ? "text-white/90 font-medium" : "text-white/50"
                    )}>
                      {reply.snippet}
                    </p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      getBadgeColor(reply.classification)
                    )}>
                      {getBadgeIcon(reply.classification)}
                      {reply.classification}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Thread View */}
        <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden relative group bg-gradient-to-b from-white/[0.02] to-transparent">
          {selectedReply ? (
            <>
              {/* Thread Header */}
              <div className="p-8 border-b border-white/5 flex items-start justify-between shrink-0 bg-black/20">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center text-2xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    {selectedReply.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedReply.company}</h2>
                    <p className="text-white/60 font-medium">Re: Application for {selectedReply.role}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-white/40 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white/20" /> {selectedReply.sender}
                      </span>
                      <span className="text-sm text-white/40 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white/20" /> {selectedReply.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thread Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                
                {/* AI Insight Banner */}
                {selectedReply.classification === "Positive" && (
                  <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-1">AI Insight</h4>
                      <p className="text-sm text-emerald-400/80 leading-relaxed">
                        This is a highly positive response requesting an interview. Consider replying promptly to secure your preferred time slot.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actual Message Body */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-[15px] leading-loose text-white/80 whitespace-pre-wrap font-medium">
                    {selectedReply.fullMessage}
                  </p>
                </div>
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
                <div className="relative">
                  <textarea 
                    placeholder="Draft a reply... AI will help you format it."
                    className="w-full h-24 rounded-2xl border border-white/10 bg-black/50 p-4 pr-16 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none shadow-inner custom-scrollbar"
                  />
                  <button className="absolute right-3 bottom-3 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <ReplyIcon className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
              <Inbox className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
