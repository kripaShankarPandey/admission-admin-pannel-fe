"use client";

import { useEffect, useState } from "react";
import {
    reviewService,
    REVIEW_STATUSES,
    type Review,
    type ReviewStatus,
} from "@/services/review-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

const STATUS_STYLES: Record<ReviewStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("ALL");

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setIsLoading(true);
        try {
            const data = await reviewService.getAll();
            setReviews(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch reviews.");
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleStatus(id: number, status: ReviewStatus) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        try {
            await reviewService.updateStatus(id, status);
            toast.success(`Review ${status.toLowerCase()}.`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update review.");
            fetchReviews();
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this review permanently?")) return;
        try {
            await reviewService.remove(id);
            toast.success("Review deleted.");
            fetchReviews();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete review.");
        }
    }

    const filtered = reviews.filter((r) => {
        const matchesSearch =
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.comment.toLowerCase().includes(search.toLowerCase()) ||
            (r.college?.college_name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const counts = reviews.reduce(
        (acc, r) => {
            acc[r.status] = (acc[r.status] ?? 0) + 1;
            return acc;
        },
        {} as Record<ReviewStatus, number>,
    );

    return (
        <ListingLayout
            title="College Reviews"
            description="Moderate student reviews. Approving a review updates the college's headline rating."
            count={filtered.length}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, college, or text..."
        >
            <div className="flex flex-wrap gap-2 px-1 pb-4">
                {(["ALL", ...REVIEW_STATUSES] as const).map((s) => {
                    const active = statusFilter === s;
                    const count = s === "ALL" ? reviews.length : (counts[s] ?? 0);
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                                active
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                            }`}
                        >
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                            <span className="ml-1.5 opacity-70">{count}</span>
                        </button>
                    );
                })}
            </div>

            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Reviewer</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">College</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Rating</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Review</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableStateRow colSpan={6} isLoading emptyLabel="" />
                    ) : filtered.length > 0 ? (
                        filtered.map((r) => (
                            <TableRow key={r.id} className="border-b border-border/50">
                                <TableCell>
                                    <div className="font-semibold text-foreground text-[13px]">{r.name}</div>
                                    {r.email && <div className="text-[11px] text-muted-foreground">{r.email}</div>}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{r.college?.college_name ?? `#${r.collegeId}`}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                    <p className="text-muted-foreground line-clamp-2 text-[13px]">{r.comment}</p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{format(new Date(r.createdAt), "MMM dd, yyyy")}</p>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-[11px] font-bold uppercase tracking-wide rounded-full border px-2.5 py-1 ${STATUS_STYLES[r.status]}`}>
                                        {r.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {r.status !== "APPROVED" && (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700" title="Approve" onClick={() => handleStatus(r.id, "APPROVED")}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {r.status !== "REJECTED" && (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700" title="Reject" onClick={() => handleStatus(r.id, "REJECTED")}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Delete" onClick={() => handleDelete(r.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableStateRow colSpan={6} emptyLabel="No reviews found." />
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
    );
}
