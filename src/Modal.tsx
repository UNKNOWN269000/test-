import { useEffect, useState, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  color: string;
  section: string;
  children?: ReactNode;
  searchTerm?: string;
  onSearch?: (searchTerm: string) => void;
}

export default function Modal({ open, onClose, title, color, section, children, searchTerm: parentSearchTerm, onSearch }: ModalProps) {
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm || "");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (parentSearchTerm !== undefined) {
      setSearchTerm(parentSearchTerm);
    }
  }, [parentSearchTerm]);

  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch, parentSearchTerm]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
              {section}
            </p>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 pb-0 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="w-full px-4 py-2.5 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 pt-2">
          {children ? (
            isValidElement(children) ? (
              cloneElement(children as any, { searchTerm })
            ) : (
              children
            )
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
