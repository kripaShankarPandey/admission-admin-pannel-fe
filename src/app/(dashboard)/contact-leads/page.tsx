"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  leadService,
  LEAD_STATUSES,
  type ContactLead,
  type LeadStatus,
} from "@/services/lead-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { LeadWorkflowPanel } from "@/components/leads/lead-workflow-panel";
import { leadWorkflowService } from "@/services/admin-tools-service";
import { Modal } from "@/components/ui/modal";

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-100 text-amber-700 border-amber-200",
  CONVERTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

// useSearchParams forces client-side rendering up to the nearest Suspense
// boundary, and a prerendered route without one fails the production build.
export default function ContactLeadsPage() {
  return (
    <Suspense fallback={null}>
      <ContactLeadsView />
    </Suspense>
  );
}

function ContactLeadsView() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);

  async function handleStatusChange(id: number, status: LeadStatus) {
    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelectedLead((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
    try {
      await leadService.updateContactLeadStatus(id, status);
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

  // Deep link from the dashboard: ?lead=<id> opens that lead's detail panel.
  const leadIdParam = searchParams.get("lead");
  useEffect(() => {
    if (!leadIdParam || leads.length === 0) return;
    const match = leads.find((l) => l.id === Number(leadIdParam));
    if (match) setSelectedLead(match);
  }, [leadIdParam, leads]);

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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.message.toLowerCase().includes(search.toLowerCase());
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
        <Modal
          title="Lead Details"
          onClose={() => setSelectedLead(null)}
          size="sm"
        >
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                ID
              </label>
              <p className="text-sm text-foreground">{selectedLead.id}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Name
              </label>
              <p className="text-sm text-foreground">{selectedLead.name}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Email
              </label>
              <a
                href={`mailto:${selectedLead.email}`}
                className="text-sm text-primary hover:underline"
              >
                {selectedLead.email}
              </a>
            </div>
            {selectedLead.number && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Phone
                </label>
                <a
                  href={`tel:${selectedLead.number}`}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedLead.number}
                </a>
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Status
              </label>
              <select
                value={selectedLead.status ?? "NEW"}
                onChange={(e) =>
                  handleStatusChange(
                    selectedLead.id,
                    e.target.value as LeadStatus,
                  )
                }
                className={`text-xs font-bold uppercase tracking-wide rounded-lg border px-3 py-1.5 cursor-pointer outline-none ${STATUS_STYLES[(selectedLead.status ?? "NEW") as LeadStatus]}`}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-card text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {selectedLead.subject && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Subject
                </label>
                <p className="text-sm text-foreground">
                  {selectedLead.subject}
                </p>
              </div>
            )}
            {selectedLead.courseInterest && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Course Interest
                </label>
                <p className="text-sm text-foreground">
                  {selectedLead.courseInterest}
                </p>
              </div>
            )}
            {selectedLead.preferredTime && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Preferred Call Time
                </label>
                <p className="text-sm text-foreground">
                  {selectedLead.preferredTime}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Message
              </label>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {selectedLead.message}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Received
              </label>
              <p className="text-sm text-foreground">
                {format(new Date(selectedLead.createdAt), "PPpp")}
              </p>
            </div>
            <LeadWorkflowPanel
              type="contact"
              leadId={selectedLead.id}
              assigneeEmail={selectedLead.assigneeEmail ?? null}
              followUpAt={selectedLead.followUpAt ?? null}
              onChanged={(patch) => {
                setSelectedLead((prev) =>
                  prev ? { ...prev, ...patch } : prev,
                );
                setLeads((prev) =>
                  prev.map((l) =>
                    l.id === selectedLead.id ? { ...l, ...patch } : l,
                  ),
                );
              }}
            />

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
        </Modal>
      )}
      <ListingLayout
        title="Contact Us Lead"
        description="Review inbound contact requests, inspect message details, and remove resolved leads."
        count={filteredLeads.length}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or message..."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              try {
                const blob = await leadWorkflowService.exportCsv("contact");
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "contact-leads.csv";
                link.click();
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error(error);
                toast.error("Failed to export leads.");
              }
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
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
              <TableHead className="w-[70px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Course Interest
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={8} isLoading emptyLabel="" />
            ) : (filteredLeads?.length || 0) > 0 ? (
              filteredLeads.map((lead) => {
                const status = (lead.status ?? "NEW") as LeadStatus;
                return (
                  <TableRow
                    key={lead.id}
                    className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <TableCell className="text-muted-foreground font-medium text-[13px]">
                      #{lead.id}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-[13px]">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[13px]">
                      {lead.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[13px]">
                      {lead.number || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[13px]">
                      {lead.courseInterest || "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusChange(
                            lead.id,
                            e.target.value as LeadStatus,
                          )
                        }
                        className={`text-[11px] font-bold uppercase tracking-wide rounded-full border px-2.5 py-1 cursor-pointer outline-none ${STATUS_STYLES[status]}`}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-card text-foreground"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[13px] whitespace-nowrap">
                      {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
              <TableStateRow colSpan={8} emptyLabel="No contact leads found." />
            )}
          </TableBody>
        </Table>
      </ListingLayout>
    </>
  );
}
