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
import { Trash2, Mail, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function ContactLeadsPage() {
    const [leads, setLeads] = useState<ContactLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchLeads();
    }, []);

    async function fetchLeads() {
        setIsLoading(true);
        try {
            const data = await leadService.getContactLeads();
            setLeads(data || []);
        } catch (error: any) {
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
        } catch (error: any) {
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
        <ListingLayout
            title="Contact Us Lead"
            count={filteredLeads.length}
            onSearchChange={setSearch}
        >
            <Table>
                <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-b border-white/5">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Contact Info</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Message</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Date</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-[#a5a5ba]">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (filteredLeads?.length || 0) > 0 ? (
                        filteredLeads.map(lead => (
                            <TableRow key={lead.id} className="group hover:bg-white/5 border-b border-white/5">
                                <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{lead.id}</TableCell>
                                <TableCell className="font-semibold text-white text-[13px]">{lead.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-[13px]">
                                        <span className="flex items-center gap-1.5 text-[#a5a5ba]">
                                            <Mail className="h-3 w-3 text-primary/60" /> {lead.email}
                                        </span>
                                        {lead.phone && (
                                            <span className="flex items-center gap-1.5 text-[#a5a5ba]">
                                                <Phone className="h-3 w-3 text-primary/60" /> {lead.phone}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-start gap-2 max-w-xs">
                                        <MessageSquare className="h-4 w-4 text-[#a5a5ba] mt-0.5 shrink-0" />
                                        <p className="text-[#a5a5ba] line-clamp-2 text-[13px]">{lead.message}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-[#a5a5ba] text-[13px] whitespace-nowrap">
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
                            <TableCell colSpan={6} className="text-center py-10 text-[#a5a5ba] font-medium">
                                No contact leads found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
    );
}
