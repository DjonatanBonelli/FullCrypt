"use client";

export function Modal({ open, onClose, children }: any) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 
        bg-black/60 
        backdrop-blur-sm 
        flex items-center justify-center
        z-50
      "
      onClick={onClose}
    >
      <div
        className="
          bg-[var(--surface-primary)]
          border border-[var(--surface-secondary)]
          rounded-xl
          p-6
          w-full max-w-md
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
