import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
          : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo + Company Name */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-[#00ff00] transition-all duration-300 shadow-md">
                <Logo />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#00ff00] ring-2 ring-white dark:ring-slate-950"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                Ultra Aluminum
              </span>
              <span className="text-xs font-semibold leading-tight text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                Pvt Ltd
              </span>
            </div>
          </a>

        </div>
      </div>
    </header>
  );
}
