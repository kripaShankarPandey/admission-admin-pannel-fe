"use client";

import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableStateRowProps {
  colSpan: number;
  isLoading?: boolean;
  emptyLabel: string;
}

export function TableStateRow({
  colSpan,
  isLoading = false,
  emptyLabel,
}: TableStateRowProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-10 text-center text-sm font-medium text-muted-foreground"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading...</span>
          </div>
        ) : (
          emptyLabel
        )}
      </TableCell>
    </TableRow>
  );
}
