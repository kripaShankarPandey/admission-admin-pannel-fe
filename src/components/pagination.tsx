import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    pageCount: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    pageCount,
    total,
    pageSize,
    onPageChange,
}: PaginationProps) {
    if (total === 0 || pageCount <= 1) return null;

    return (
        <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                    Page {currentPage} of {pageCount}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pageCount}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
