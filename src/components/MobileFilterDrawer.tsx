import { useEffect } from "react";
import type { ReactNode } from "react";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  title,
  children,
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-slate-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
