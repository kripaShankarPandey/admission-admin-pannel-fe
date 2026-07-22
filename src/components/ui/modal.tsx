"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * The dashboard's modal shell.
 *
 * Seven pages had each hand-rolled the same `fixed inset-0` overlay, and every
 * copy was missing the same four things: Escape did not close it, clicking the
 * backdrop did not close it, the page behind kept scrolling, and there was no
 * dialog role — so a screen reader announced nothing and Tab walked straight
 * out of the modal into the page underneath.
 *
 * Widths stay per-page via `size`; everything else is fixed here so the next
 * modal cannot reintroduce the same gaps.
 *
 * It renders through a portal into <body>. `position: fixed` is resolved against
 * the nearest ancestor that has a transform/filter rather than the viewport, and
 * the dashboard wraps every page in `.animate-page-in` — so without the portal
 * the modal centred itself inside the page content box and the backdrop covered
 * only that box, leaving the top bar undimmed.
 */
type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  title,
  onClose,
  children,
  size = "md",
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: Size;
  /** Pinned below the scroll area, so long forms keep their actions reachable. */
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    // Remember what opened the modal so focus can go back there on close;
    // otherwise focus falls to <body> and keyboard users lose their place.
    const opener = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap. Without it Tab leaves the modal and lands on the page
      // behind the backdrop, which is still there but not reachable by mouse.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Lock the background. The scrollbar is compensated for so the layout
    // behind does not shift sideways as the modal opens.
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    // Move focus into the modal rather than leaving it on the trigger.
    panelRef.current
      ?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, select, button',
      )
      ?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, [onClose]);

  // <body> is absent during SSR. Callers only mount this once a record is
  // selected, so that never happens in practice — but the guard keeps the
  // component safe to render anywhere.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      // Only a click that starts *and* ends on the backdrop closes it: dragging
      // a text selection out of the panel must not dismiss a half-filled form.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[90vh] w-full ${SIZES[size]} flex-col rounded-2xl border border-border bg-card shadow-xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 id={titleId} className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
