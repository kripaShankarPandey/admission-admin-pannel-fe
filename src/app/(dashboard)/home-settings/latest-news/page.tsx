"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { latestNewsService, type LatestNews } from "@/services/latest-news-service";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

export default function LatestNewsPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<LatestNews[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const debouncedSearch = useDebounce(search, 500);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await latestNewsService.getAll({
        page: currentPage,
        pageSize,
        search: debouncedSearch || undefined,
        status: (statusFilter === "published" || statusFilter === "draft") ? statusFilter : undefined,
      });
      setNewsList(response.data ?? []);
      setMeta(response?.meta?.pagination ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch news.");
      setNewsList([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this news item?")) return;
    try {
      await latestNewsService.delete(id);
      toast.success("News item deleted.");
      fetchNews();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  return (
    <ListingLayout
      title="Latest News"
      description="Manage homepage news items — featured and latest."
      searchPlaceholder="Search by headline…"
      onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
      onCreateClick={() => router.push("/home-settings/latest-news/new")}
      createLabel="New News Item"
      filterLabel="Status"
      filterOptions={[
        { label: "All", value: "" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ]}
      onFilterChange={(f) => { setStatusFilter(f.status ?? ""); setCurrentPage(1); }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Headline</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(isLoading || newsList.length === 0) && (
            <TableStateRow
              isLoading={isLoading}
              colSpan={7}
              emptyLabel="No news items found. Create one to get started."
            />
          )}
          {!isLoading && newsList.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-10 w-16 rounded-md object-cover border border-border" />
                ) : (
                  <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center border border-border">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[260px]">
                  <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                  {item.excerpt && <p className="text-xs text-muted-foreground truncate mt-0.5">{item.excerpt}</p>}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">{item.slug}</TableCell>
              <TableCell>
                {item.is_featured
                  ? <Badge variant="outline" className="gap-1 border-amber-200 text-amber-700 bg-amber-50"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Featured</Badge>
                  : <span className="text-xs text-muted-foreground">—</span>
                }
              </TableCell>
              <TableCell>
                <Badge variant={item.publishedAt ? "default" : "secondary"} className={item.publishedAt ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                  {item.publishedAt ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/home-settings/latest-news/edit/${item.id}`)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.pageCount > 1 && (
        <Pagination
          currentPage={currentPage}
          pageCount={meta.pageCount}
          total={meta.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </ListingLayout>
  );
}
