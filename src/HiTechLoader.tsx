interface Props {
  text?: string;
}

export default function HiTechLoader({ text = "Loading" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Main Animation Container */}
      <div className="relative w-80 h-32 mb-8">
        {/* Connection Line: Cloud → Server */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 w-24 h-0.5">
          <div className="absolute inset-0 bg-slate-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[flowRight_1.2s_linear_infinite]"></div>
        </div>

        {/* Connection Line: Server → Local PC */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-24 h-0.5">
          <div className="absolute inset-0 bg-slate-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[flowRight_1.2s_linear_infinite_0.4s]"></div>
        </div>

        {/* Cloud Icon (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse"></div>
            <svg className="relative w-12 h-12 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.42 9.22a5.5 5.5 0 00-9.84-1.66A4 4 0 006 15h13a3.5 3.5 0 00-.58-5.78z"/>
            </svg>
          </div>
          <span className="text-[9px] font-bold text-cyan-400 mt-1 uppercase tracking-wider">Cloud</span>
        </div>

        {/* Server Icon (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full animate-pulse"></div>
            <svg className="relative w-12 h-12 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="8" rx="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6" stroke="white" strokeWidth="2"/>
              <line x1="6" y1="18" x2="6.01" y2="18" stroke="white" strokeWidth="2"/>
            </svg>
            {/* Status LEDs */}
            <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute top-1 right-3 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          </div>
          <span className="text-[9px] font-bold text-green-400 mt-1 uppercase tracking-wider">Server</span>
        </div>

        {/* Local PC Icon (Right) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse"></div>
            <svg className="relative w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-2 bg-blue-400/10 rounded animate-pulse"></div>
          </div>
          <span className="text-[9px] font-bold text-blue-400 mt-1 uppercase tracking-wider">Local PC</span>
        </div>

        {/* Data Packets on Line 1 */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 w-24 h-1 pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee] animate-[packet1_1.2s_linear_infinite]"></div>
        </div>

        {/* Data Packets on Line 2 */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-24 h-1 pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_6px_#60a5fa] animate-[packet2_1.2s_linear_infinite_0.4s]"></div>
        </div>
      </div>

      {/* Status Text */}
      <div className="flex flex-col items-center gap-3">
        {/* Loading message */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#00ff00] tracking-wider uppercase">
            {text}
          </span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>

        {/* Sync Flow Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
            Cloud
          </span>
          <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            Server
          </span>
          <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></span>
            Local PC
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-72 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-green-400 to-blue-400 animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes flowRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes packet1 {
          0% { left: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes packet2 {
          0% { left: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
