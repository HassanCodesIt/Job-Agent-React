import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card border border-card-border rounded-2xl p-12 max-w-lg w-full shadow-2xl flex flex-col items-center text-center">
        <div className="h-20 w-20 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">Application Sent!</h1>
        
        <p className="text-zinc-400 mb-10 text-lg">
          Your personalized email outreach has been successfully dispatched to the hiring team. Good luck!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/"
            className="flex-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 px-6 transition-all text-center"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/apply"
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-3.5 px-6 transition-all shadow-lg shadow-teal-500/20"
          >
            <span>Apply Another</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
