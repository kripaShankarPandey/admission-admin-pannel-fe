"use client";

import { useEffect, useState } from "react";
import {
    leadService,
    LEAD_STATUSES,
    type CounselorLead,
    type LeadStatus,
} from "@/services/lead-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

const STATUS_STYLES: Record<LeadStatus, string> = {
    NEW: "bg-blue-100 text-blue-700 border-blue-200",
    CONTACTED: "bg-amber-100 text-amber-700 border-amber-200",
    CONVERTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function CounselorLeadsPage() {
    const [leads, setLeads] = useState<CounselorLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
    const [selectedLead, setSelectedLead] = useState<CounselorLead | null>(null);

    async function handleStatusChange(id: number, status: LeadStatus) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
        try {
            await leadService.updateCounselorLeadStatus(id, status);
            toast.success(`Lead marked ${status.toLowerCase()}.`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status.");
            fetchLeads();
        }
    }

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        setIsLoading(true);
        try {
            const data = await leadService.getCounselorLeads();
            setLeads(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch counselor leads.");
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this lead?")) return;

        try {
            await leadService.deleteCounselorLead(id);
            toast.success("Lead deleted successfully.");
            fetchLeads();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete lead.");
        }
    }

    const filteredLeads = leads.filter(lead => {
        const q = search.toLowerCase();
        const matchesSearch =
            lead.name.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            (lead.collegeName?.toLowerCase().includes(q) ?? false) ||
            (lead.counselorName?.toLowerCase().includes(q) ?? false);
        const matchesStatus =
            statusFilter === "ALL" || (lead.status ?? "NEW") === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = leads.reduce(
        (acc, l) => {
            const s = (l.status ?? "NEW") as LeadStatus;
            acc[s] = (acc[s] ?? 0) + 1;
            return acc;
        },
        {} as Record<LeadStatus, number>,
    );

    return (
        <>
        {selectedLead && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Counselor Lead</h2>
                        <button
                            onClick={() => setSelectedLead(null)}
                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">ID</label>
                            <p className="text-sm text-foreground">{selectedLead.id}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Name</label>
                            <p className="text-sm text-foreground">{selectedLead.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Phone</label>
                            <a href={`tel:${selectedLead.phone}`} className="text-sm text-primary hover:underline">{selectedLead.phone}</a>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">College</label>
                            <p className="text-sm text-foreground">{selectedLead.collegeName || '—'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Counselor</label>
                            <p className="text-sm text-foreground">{selectedLead.counselorName || '—'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Status</label>
                            <select
                                value={selectedLead.status ?? "NEW"}
                                onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                                className={`text-xs font-bold uppercase tracking-wide rounded-lg border px-3 py-1.5 cursor-pointer outline-none ${STATUS_STYLES[(selectedLead.status ?? "NEW") as LeadStatus]}`}
                            >
                                {LEAD_STATUSES.map((s) => (
                                    <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Received</label>
                            <p className="text-sm text-foreground">{format(new Date(selectedLead.createdAt), "PPpp")}</p>
                        </div>
                        <div className="pt-4 border-t border-border flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSelectedLead(null)}
                            >
                                Close
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => {
                                    handleDelete(selectedLead.id);
                                    setSelectedLead(null);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        <ListingLayout
            title="Counselor Leads"
            description="Requests submitted from the college page counselor popup — name, phone, college and chosen counselor."
            count={filteredLeads.length}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, phone, college or counselor..."
        >
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 px-1 pb-4">
                {(["ALL", ...LEAD_STATUSES] as const).map((s) => {
                    const active = statusFilter === s;
                    const count = s === "ALL" ? leads.length : (statusCounts[s] ?? 0);
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
                        <TableHead className="w-[70px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Phone</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">College</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Counselor</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableStateRow colSpan={8} isLoading emptyLabel="" />
                    ) : (filteredLeads?.length || 0) > 0 ? (
                        filteredLeads.map(lead => {
                            const status = (lead.status ?? "NEW") as LeadStatus;
                            return (
                            <TableRow key={lead.id} className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                <TableCell className="text-muted-foreground font-medium text-[13px]">#{lead.id}</TableCell>
                                <TableCell className="font-semibold text-foreground text-[13px]">{lead.name}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{lead.phone}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{lead.collegeName || '—'}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{lead.counselorName || '—'}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                        className={`text-[11px] font-bold uppercase tracking-wide rounded-full border px-2.5 py-1 cursor-pointer outline-none ${STATUS_STYLES[status]}`}
                                    >
                                        {LEAD_STATUSES.map((s) => (
                                            <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                                        ))}
                                    </select>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[13px] whitespace-nowrap">
                                    {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(lead.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            );
                        })
                    ) : (
                        <TableStateRow colSpan={8} emptyLabel="No counselor leads found." />
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
        </>
    );
}
