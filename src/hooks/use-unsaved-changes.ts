"use client";

import { useEffect } from "react";

/**
 * Warns before leaving a page with unsaved edits.
 *
 * The college form is thousands of inputs long; a stray browser Back or a
 * closed tab used to discard the lot silently. `beforeunload` covers reloads,
 * tab closes and external navigation — the browser shows its own dialog and the
 * message text cannot be customised, which is why none is passed.
 *
 * In-app route changes are not covered by this event; call it alongside an
 * explicit confirm on any custom "leave" control.
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome still requires returnValue to be set for the prompt to show.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
