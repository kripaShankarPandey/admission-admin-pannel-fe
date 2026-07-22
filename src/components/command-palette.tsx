"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { searchService, type SearchHit } from "@/services/admin-tools-service";

/**
 * ⌘K / Ctrl-K search across colleges, courses, blogs, cities, leads and users.
 * With a dozen sidebar sections, jumping to a record was four clicks; this
 * makes it two keystrokes.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  // Focus only — the reset lives in `close()` so state never changes as a
  // side effect of rendering.
  useEffect(() => {
    if (!open) return;
    // The dialog mounts before the browser can focus it, hence the tick.
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);

  // Debounced: typing a college name should not fire a query per keystroke.
  // Short queries simply never render their stale hits (see the guard below),
  // so nothing has to be cleared synchronously here.
  useEffect(() => {
    if (query.trim().length < 2) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setIsSearching(true);
      searchService
        .find(query)
        .then((results) => {
          if (!cancelled) {
            setHits(results);
            setActiveIndex(0);
          }
        })
        .catch((error) => console.error(error))
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const grouped = useMemo(() => {
    const byType = new Map<string, SearchHit[]>();
    hits.forEach((hit) => {
      const list = byType.get(hit.type) ?? [];
      list.push(hit);
      byType.set(hit.type, list);
    });
    return Array.from(byType.entries());
  }, [hits]);

  function go(hit: SearchHit) {
    close();
    router.push(hit.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && hits[activeIndex]) {
      event.preventDefault();
      go(hits[activeIndex]);
    }
  }

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search colleges, courses, blogs, leads…"
            className="w-full bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {isSearching && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Type at least two characters. Press{" "}
              <kbd className="rounded border border-border px-1">Esc</kbd> to
              close.
            </p>
          ) : hits.length === 0 && !isSearching ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Nothing found for “{query}”.
            </p>
          ) : (
            grouped.map(([type, typeHits]) => (
              <div key={type}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {type}
                </p>
                {typeHits.map((hit) => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  return (
                    <button
                      key={`${hit.type}-${hit.id}`}
                      type="button"
                      onClick={() => go(hit)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors ${
                        isActive ? "bg-primary/10" : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {hit.title}
                      </span>
                      {hit.subtitle && (
                        <span className="shrink-0 truncate text-[11px] text-muted-foreground">
                          {hit.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border px-1">↑</kbd>
            <kbd className="ml-0.5 rounded border border-border px-1">↓</kbd> to
            navigate
          </span>
          <span>
            <kbd className="rounded border border-border px-1">↵</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
