"use client";

import { useCallback, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, Loader2, MessageSquarePlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  leadWorkflowService,
  type LeadNote,
  type LeadType,
} from "@/services/admin-tools-service";
import { userService, type User } from "@/services/user-service";
import { apiErrorMessage } from "@/lib/api-error";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40";

/**
 * Assignment, follow-up date and the note trail for one lead. Shared by the
 * contact and counselor pipelines — the only difference is the `type`.
 */
export function LeadWorkflowPanel({
  type,
  leadId,
  assigneeEmail,
  followUpAt,
  onChanged,
}: {
  type: LeadType;
  leadId: number;
  assigneeEmail: string | null;
  followUpAt: string | null;
  onChanged: (patch: {
    assigneeEmail?: string | null;
    followUpAt?: string | null;
  }) => void;
}) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      setNotes(await leadWorkflowService.listNotes(type, leadId));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [type, leadId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    userService
      .getAll()
      // Only staff can own a lead; website users are not assignable.
      .then((rows) =>
        setAdmins(
          rows.filter((u) => u.role === "super_admin" || u.role === "editor"),
        ),
      )
      .catch((error) => console.error(error));
  }, []);

  async function assign(email: string) {
    const admin = admins.find((a) => a.email === email);
    try {
      await leadWorkflowService.update(type, leadId, {
        assigneeId: admin?.id ?? 0,
        assigneeEmail: email,
      });
      onChanged({ assigneeEmail: email || null });
      toast.success(email ? `Assigned to ${email}.` : "Assignment cleared.");
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to assign the lead."));
    }
  }

  async function setFollowUp(value: string) {
    try {
      // An empty input clears the reminder; the API treats null as "clear".
      const iso = value ? new Date(value).toISOString() : null;
      await leadWorkflowService.update(type, leadId, { followUpAt: iso });
      onChanged({ followUpAt: iso });
      toast.success(iso ? "Follow-up set." : "Follow-up cleared.");
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to set the follow-up."));
    }
  }

  async function addNote() {
    const body = draft.trim();
    if (!body) return;
    setIsSaving(true);
    try {
      await leadWorkflowService.addNote(type, leadId, body);
      setDraft("");
      loadNotes();
      toast.success("Note added.");
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to add the note."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5" />
            Assigned to
          </label>
          <select
            value={assigneeEmail ?? ""}
            onChange={(e) => assign(e.target.value)}
            className={INPUT}
          >
            <option value="">Unassigned</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.email ?? ""}>
                {admin.name || admin.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            Follow up on
          </label>
          <input
            type="datetime-local"
            // datetime-local wants "YYYY-MM-DDTHH:mm" with no zone or seconds.
            value={followUpAt ? followUpAt.slice(0, 16) : ""}
            onChange={(e) => setFollowUp(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Follow-up notes
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Called, asked to ring back after 6pm…"
          className={INPUT}
        />
        <Button
          size="sm"
          className="mt-2"
          onClick={addNote}
          disabled={isSaving || !draft.trim()}
        >
          {isSaving ? "Adding..." : "Add note"}
        </Button>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : notes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border/60 bg-muted/20 p-2.5"
              >
                <p className="whitespace-pre-wrap text-[13px] text-foreground">
                  {note.body}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {note.authorEmail ?? "unknown"} ·{" "}
                  <span title={format(new Date(note.createdAt), "PPpp")}>
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
