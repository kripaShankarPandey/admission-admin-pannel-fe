"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { mediaService, type MediaItem } from "@/services/admin-tools-service";
import { apiErrorMessage } from "@/lib/api-error";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mediaService.list({ limit: 60 });
      setItems(res.items ?? []);
      setNextToken(res.nextToken);
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to load the media library."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    if (!nextToken) return;
    setIsLoadingMore(true);
    try {
      // S3 pages with a continuation token, so this appends rather than jumps.
      const res = await mediaService.list({ token: nextToken, limit: 60 });
      setItems((prev) => [...prev, ...(res.items ?? [])]);
      setNextToken(res.nextToken);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load more files.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleDelete(item: MediaItem) {
    if (
      !confirm(
        `Delete ${item.key}?\n\nAnything still pointing at this file — a college image, a blog banner — will show a broken image. This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await mediaService.remove(item.key);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      toast.success("File deleted.");
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to delete the file."));
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied.");
    } catch {
      toast.error("Could not copy — copy it from the address bar instead.");
    }
  }

  // Filtering is client-side over the loaded page: S3 has no substring search,
  // and the prefix filter only matches from the start of the key.
  const filtered = items.filter((item) =>
    item.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ListingLayout
      title="Media Library"
      description="Everything uploaded to S3. Reuse a URL instead of uploading the same image twice, and clear out files nothing references."
      count={filtered.length}
      onSearchChange={setSearch}
      searchPlaceholder="Filter loaded files by name..."
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No files found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item) => (
              <div
                key={item.key}
                className="group overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative flex h-32 items-center justify-center bg-muted/30">
                  <img
                    src={item.url}
                    alt={item.key}
                    loading="lazy"
                    className="h-full w-full object-contain p-2"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 gap-1.5"
                      onClick={() => copyUrl(item.url)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-0.5 p-2.5">
                  <p
                    className="truncate text-[11px] font-semibold text-foreground"
                    title={item.key}
                  >
                    {item.key.split("/").pop()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(item.size)} ·{" "}
                    {format(new Date(item.lastModified), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {nextToken && (
            <div className="flex justify-center border-t border-border/50 py-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="gap-1.5"
              >
                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </ListingLayout>
  );
}
