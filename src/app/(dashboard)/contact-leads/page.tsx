"use client";

import { useEffect, useState } from "react";
import { leadService, type ContactLead } from "@/services/lead-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

export default function ContactLeadsPage() {
    const [leads, setLeads] = useState<ContactLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        setIsLoading(true);
        try {
            const data = await leadService.getContactLeads();
            setLeads(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch contact leads.");
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            await leadService.deleteContactLead(id);
            toast.success("Message deleted successfully.");
            fetchLeads();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete message.");
        }
    }

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.message.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
        {selectedLead && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Lead Details</h2>
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
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Email</label>
                            <a href={`mailto:${selectedLead.email}`} className="text-sm text-primary hover:underline">{selectedLead.email}</a>
                        </div>
                        {selectedLead.phone && (
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Phone</label>
                                <a href={`tel:${selectedLead.phone}`} className="text-sm text-primary hover:underline">{selectedLead.phone}</a>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Message</label>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{selectedLead.message}</p>
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
            title="Contact Us Lead"
            description="Review inbound contact requests, inspect message details, and remove resolved leads."
            count={filteredLeads.length}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, email, or message..."
        >
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Email</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Phone</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Message</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableStateRow colSpan={6} isLoading emptyLabel="" />
                    ) : (filteredLeads?.length || 0) > 0 ? (
                        filteredLeads.map(lead => (
                            <TableRow key={lead.id} className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                <TableCell className="text-muted-foreground font-medium text-[13px]">#{lead.id}</TableCell>
                                <TableCell className="font-semibold text-foreground text-[13px]">{lead.name}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{lead.email}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{lead.phone || '—'}</TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-2 max-w-xs">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <p className="text-muted-foreground line-clamp-2 text-[13px]">{lead.message}</p>
                                    </div>
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
                        ))
                    ) : (
                        <TableStateRow colSpan={6} emptyLabel="No contact leads found." />
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
        </>
    );
}
