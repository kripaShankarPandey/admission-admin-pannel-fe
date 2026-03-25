"use client";

import { useEffect, useState } from "react";
import { leadService, type NewsletterLead } from "@/services/lead-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function NewsletterLeadsPage() {
    const [leads, setLeads] = useState<NewsletterLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        setIsLoading(true);
        try {
            const data = await leadService.getNewsletterLeads();
            setLeads(data || []);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to fetch newsletter subscribers.");
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this subscriber?")) return;

        try {
            await leadService.deleteNewsletterLead(id);
            toast.success("Subscriber removed successfully.");
            fetchLeads();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to remove subscriber.");
        }
    }

    const filteredLeads = leads.filter(lead =>
        lead.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ListingLayout
            title="Newsletter Subscription"
            count={filteredLeads.length}
            onSearchChange={setSearch}
        >
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Email Address</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Date Joined</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-muted-foreground">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (filteredLeads?.length || 0) > 0 ? (
                        filteredLeads.map(lead => (
                            <TableRow key={lead.id} className="group hover:bg-muted/50 border-b border-border/50">
                                <TableCell className="text-muted-foreground font-medium text-[13px]">#{lead.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-semibold text-foreground text-[13px]">{lead.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">
                                    {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
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
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium">
                                No subscribers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
    );
}
