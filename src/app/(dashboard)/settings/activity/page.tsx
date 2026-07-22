"use client";

import { useCallback, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import {
  auditService,
  type AuditEntry,
} from "@/services/admin-tools-service";

const SELECT =
  "h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-600",
  UPDATE: "bg-amber-500/10 text-amber-700",
  DELETE: "bg-red-500/10 text-red-600",
};

const PAGE_SIZE = 50;

export default function ActivityLogPage() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [options, setOptions] = useState<{
    userEmails: string[];
    entityTypes: string[];
    actions: string[];
  }>({ userEmails: [], entityTypes: [], actions: [] });

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await auditService.getAll({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        userEmail: userEmail || undefined,
        entityType: entityType || undefined,
        action: action || undefined,
      });
      setRows(res.data ?? []);
      setTotal(res.meta?.pagination?.total ?? 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load the activity log.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, userEmail, entityType, action]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    auditService
      .filterOptions()
      .then(setOptions)
      .catch((error) => console.error(error));
  }, []);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, userEmail, entityType, action]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <ListingLayout
      title="Activity Log"
      description="Every create, update and delete made through the admin panel. Read-only — entries cannot be edited or removed."
      count={total}
      onSearchChange={setSearch}
      searchPlaceholder="Search by user, entity or IP..."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className={SELECT}
          >
            <option value="">All users</option>
            {options.userEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className={SELECT}
          >
            <option value="">All sections</option>
            {options.entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className={SELECT}
          >
            <option value="">All actions</option>
            {options.actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <Table>
        <TableHeader className="bg-card">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              When
            </TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              Who
            </TableHead>
            <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              Action
            </TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              Section
            </TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              Record
            </TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              From
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableStateRow colSpan={6} isLoading emptyLabel="" />
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border/50 hover:bg-muted/40"
              >
                <TableCell className="text-[12px] text-muted-foreground whitespace-nowrap">
                  <span title={format(new Date(row.createdAt), "PPpp")}>
                    {formatDistanceToNow(new Date(row.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-[13px] font-medium text-foreground">
                  {row.userEmail ?? (
                    <span className="text-muted-foreground italic">
                      anonymous
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      ACTION_STYLES[row.action] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.action}
                  </span>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  {row.entityType ?? "—"}
                </TableCell>
                <TableCell className="text-[12px] font-mono text-muted-foreground">
                  {row.entityId ?? "—"}
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground">
                  <span title={row.userAgent ?? ""}>{row.ipAddress ?? "—"}</span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableStateRow
              colSpan={6}
              emptyLabel="No activity matches these filters."
            />
          )}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </ListingLayout>
  );
}
