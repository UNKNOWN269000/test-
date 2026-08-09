import { useState, type MouseEvent } from "react";
import type { ReactNode } from "react";
import Modal from "./Modal";
import ProfileIncomeTable from "./ProfileIncomeTable";
import BucketIncomeTable from "./BucketIncomeTable";
import AgingRecordTable from "./AgingRecordTable";
import PowdercoatProductionTable from "./PowdercoatProductionTable";
import PowdercoatPackingTable from "./PowdercoatPackingTable";
import WoodFinishProductionTable from "./WoodFinishProductionTable";
import WoodFinishPackingTable from "./WoodFinishPackingTable";
import AnodizingBarBindingTable from "./AnodizingBarBindingTable";
import AnodizingProductionTable from "./AnodizingProductionTable";
import AnodizingPackingTable from "./AnodizingPackingTable";

type Section = {
  title: string;
  accent: "amber" | "slate" | "blue";
  buttons: { label: string; color: string }[];
};

const sections: Section[] = [
  {
    title: "Extrusion",
    accent: "amber",
    buttons: [
      { label: "Profile Income", color: "#00ffff" },
      { label: "Bucket Income", color: "#00ff00" },
      { label: "Aging Details", color: "#ffcc00" },
    ],
  },
  {
    title: "Powder Coat",
    accent: "slate",
    buttons: [
      { label: "Powdercoat Production", color: "#ff00ff" },
      { label: "Powdercoat Packing", color: "#ff00ff" },
      { label: "Wood Finish Production", color: "#ff6600" },
      { label: "Wood Finish Packing", color: "#ff6600" },
    ],
  },
  {
    title: "Anodizing",
    accent: "blue",
    buttons: [
      { label: "Anodizing Bar Binding", color: "#00ccff" },
      { label: "Anodizing Production", color: "#00ccff" },
      { label: "Anodizing Packing", color: "#00ccff" },
    ],
  },
];

const accentMap = {
  amber: {
    text: "text-[#00ff00] dark:text-[#00ff00]",
    border: "border-[#00ff00]/60 dark:border-[#00ff00]/30",
    dot: "bg-[#00ff00]",
    icon: "bg-gradient-to-br from-[#00ff00] to-[#00cc00]",
  },
  slate: {
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300/60 dark:border-slate-500/30",
    dot: "bg-slate-700 dark:bg-slate-300",
    icon: "bg-gradient-to-br from-slate-700 to-slate-900",
  },
  blue: {
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300/60 dark:border-blue-500/30",
    dot: "bg-blue-500",
    icon: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
};

function SectionIcon({ type }: { type: "amber" | "slate" | "blue" }) {
  const cls = accentMap[type].icon;
  if (type === "amber") {
    return (
      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl ${cls} text-white shadow-lg`}>
        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </div>
    );
  }
  if (type === "slate") {
    return (
      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl ${cls} text-white shadow-lg`}>
        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl ${cls} text-white shadow-lg`}>
      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
  );
}

interface ButtonProps {
  label: string;
  color: string;
  accent: "amber" | "slate" | "blue";
  isActive: boolean;
  onClick: () => void;
  onOpenModal: () => void;
}

interface ModalState {
  open: boolean;
  section: string;
  title: string;
  color: string;
  body?: ReactNode;
}

function HoverFillButton({ label, color, accent, isActive, onClick, onOpenModal }: ButtonProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [clicked, setClicked] = useState(false);

  const updatePosFromEvent = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const a = accentMap[accent];

  const fillActive = hovered || clicked;
  const fillX = clicked && !hovered && clickPos ? clickPos.x : pos.x;
  const fillY = clicked && !hovered && clickPos ? clickPos.y : pos.y;

  const fillStyle: React.CSSProperties = {
    background: `radial-gradient(circle 220px at ${fillX}px ${fillY}px, ${color} 0%, ${color}cc 35%, ${color}55 65%, ${color}00 100%)`,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setClickPos({ x: cx, y: cy });
    setClicked(true);
    onClick();
    onOpenModal();
    window.setTimeout(() => setClicked(false), 450);
  };

  return (
    <button
      onClick={handleClick}
      onMouseMove={updatePosFromEvent}
      onMouseEnter={(e) => {
        setHovered(true);
        updatePosFromEvent(e as unknown as MouseEvent<HTMLButtonElement>);
      }}
      onMouseLeave={() => setHovered(false)}
      className={`group/btn relative w-full flex items-center justify-between gap-3 rounded-xl border ${a.border} bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3.5 sm:px-5 sm:py-3.5 text-left text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 overflow-hidden transition-all duration-200 ${
        isActive ? "ring-2 ring-amber-500/50" : ""
      }`}
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 ${
          fillActive ? "opacity-100" : "opacity-0"
        }`}
        style={fillStyle}
        aria-hidden="true"
      />

      {clicked && clickPos && (
        <span
          key={`${clickPos.x}-${clickPos.y}-${clicked}`}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: clickPos.x,
            top: clickPos.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)",
            border: `2px solid ${color}`,
            opacity: 0.8,
            animation: "btn-ripple 450ms ease-out forwards",
          }}
          aria-hidden="true"
        />
      )}

      <span className="relative z-10 flex items-center gap-3 min-w-0 transition-colors duration-200 group-hover/btn:text-white">
        <span
          className={`flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-md ${a.icon} text-white shadow-sm transition-transform duration-200 group-hover/btn:scale-110`}
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <span className="truncate">{label}</span>
      </span>

      <svg
        className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  );
}

export default function Sections() {
  const [active, setActive] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<ModalState>({
    open: false,
    section: "",
    title: "",
    color: "#fbbf24",
  });

  const openModal = (section: string, title: string, color: string, body?: ReactNode) => {
    setSearchTerm("");
    setModal({ open: true, section, title, color, body });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <section className="relative pb-20 pt-2 px-3 sm:px-6 lg:px-8 bg-gray-950">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        {sections.map((section) => {
          const accent = accentMap[section.accent];
          return (
            <div key={section.title} className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 dark:from-slate-700/30 dark:to-slate-800/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative rounded-2xl border border-white/40 dark:border-slate-700/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl backdrop-saturate-150 shadow-lg shadow-slate-900/5 dark:shadow-black/30 p-4 sm:p-6">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30 dark:ring-slate-700/30 pointer-events-none"></div>

                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <SectionIcon type={section.accent} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}></span>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${accent.text}`}>
                        {section.title}
                      </h2>
                    </div>
                    <p className="mt-0.5 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                      {section.buttons.length} module{section.buttons.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {section.buttons.map((btn) => {
                    const key = `${section.title}::${btn.label}`;
                    return (
                      <HoverFillButton
                        key={btn.label}
                        label={btn.label}
                        color={btn.color}
                        accent={section.accent}
                        isActive={active === key}
                        onClick={() => setActive(key)}
                        onOpenModal={() => {
                          if (btn.label === "Profile Income") {
                            openModal(section.title, btn.label, btn.color, <ProfileIncomeTable />);
                          } else if (btn.label === "Bucket Income") {
                            openModal(section.title, btn.label, btn.color, <BucketIncomeTable />);
                          } else if (btn.label === "Aging Details" || btn.label === "Aging Record") {
                            openModal(section.title, btn.label, btn.color, <AgingRecordTable />);
                          } else if (btn.label === "Powdercoat Production") {
                            openModal(section.title, btn.label, btn.color, <PowdercoatProductionTable />);
                          } else if (btn.label === "Wood Finish Production") {
                            openModal(section.title, btn.label, btn.color, <WoodFinishProductionTable />);
                          } else if (btn.label === "Powder Coat Packing" || btn.label === "PowderCoat Packing" || btn.label === "Powdercoat Packing") {
                            openModal(section.title, btn.label, btn.color, <PowdercoatPackingTable />);
                          } else if (btn.label === "Wood Finish Packing" || btn.label === "WoodFinish Packing" || btn.label === "Woodfinish Packing") {
                            openModal(section.title, btn.label, btn.color, <WoodFinishPackingTable />);
                          } else if (btn.label === "Anodizing Bar Binding" || btn.label === "Anodizing Bind" || btn.label === "Bar Binding") {
                            openModal(section.title, btn.label, btn.color, <AnodizingBarBindingTable />);
                          } else if (btn.label === "Anodizing Production" || btn.label === "Anodizing Prod") {
                            openModal(section.title, btn.label, btn.color, <AnodizingProductionTable />);
                          } else if (btn.label === "Anodizing Packing" || btn.label === "Anodizing Pack") {
                            openModal(section.title, btn.label, btn.color, <AnodizingPackingTable />);
                          } else {
                            openModal(section.title, btn.label, btn.color);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        color={modal.color}
        section={modal.section}
        searchTerm={searchTerm}
        onSearch={handleSearch}
      >
        {modal.body}
      </Modal>
    </section>
  );
}
