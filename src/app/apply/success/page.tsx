import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      
      {/* Container matching the modal design */}
      <div className="bg-[#1E2128] border border-white/5 rounded-2xl p-8 max-w-[420px] w-full shadow-2xl flex flex-col items-center text-center relative">
        
        {/* Fake Close Button to match modal aesthetic */}
        <Link 
          href="/"
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        {/* 3D Green Checkmark Icon */}
        <div className="h-20 w-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-[0_8px_16px_rgba(16,185,129,0.3)] border-t border-emerald-300/50 transform -rotate-2">
          <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Email Sent Successfully!</h1>
        
        <p className="text-zinc-400 mb-8 text-sm px-2">
          Your application has been delivered to the recruiter.<br />
          Redirecting to your tracking dashboard...
        </p>
        
        <Link
          href="/"
          className="w-full flex items-center justify-center rounded-xl bg-[#5252FF] hover:bg-[#4343E6] text-white font-semibold py-3.5 transition-colors cursor-pointer shadow-lg shadow-[#5252FF]/20"
        >
          Continue to Dashboard
        </Link>
      </div>

      <div className="mt-8">
        <Link 
          href="/apply" 
          className="text-sm font-medium text-zinc-500 hover:text-white transition-colors underline underline-offset-4"
        >
          Or apply to another job
        </Link>
      </div>

    </div>
  );
}
