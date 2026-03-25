"use client";

import * as React from "react";
import { Plus, Search, Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterOption {
    label: string;
    value: string;
}

interface ListingLayoutProps {
    title: string;
    count?: number;
    onCreateClick?: () => void;
    onSearchChange?: (value: string) => void;
    onFilterChange?: (filter: { status?: string }) => void;
    filterOptions?: FilterOption[];
    filterLabel?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export function ListingLayout({
    title,
    count,
    onCreateClick,
    onSearchChange,
    onFilterChange,
    filterOptions,
    filterLabel,
    actions,
    children,
}: ListingLayoutProps) {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [activeFilter, setActiveFilter] = React.useState<string>("");

    const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
        { label: "All", value: "" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
    ];

    const OPTIONS = filterOptions || DEFAULT_STATUS_OPTIONS;

    const handleFilterSelect = (value: string) => {
        setActiveFilter(value);
        onFilterChange?.({ status: value || undefined });
        setIsFilterOpen(false);
    };

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    {count !== undefined && (
                        <p className="text-sm text-muted-foreground font-medium">
                            {count} {count === 1 ? 'entry' : 'entries'} found
                        </p>
                    )}
                </div>
                {onCreateClick && (
                    <Button
                        onClick={onCreateClick}
                        size="sm"
                        className="h-9 px-4 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs rounded-lg shadow-sm"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Create new entry
                    </Button>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search..."
                            className="h-9 pl-9 bg-background border-border/50 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    {actions}

                    {/* Filter Button */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn(
                                "h-9 px-3 text-xs font-semibold bg-background border-border/50 gap-1.5 rounded-lg",
                                activeFilter && "border-primary/40 text-primary bg-primary/5"
                            )}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {activeFilter && (
                                <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                                    1
                                </span>
                            )}
                            <ChevronDown className={cn("h-3 w-3 transition-transform", isFilterOpen && "rotate-180")} />
                        </Button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-background border border-border/60 rounded-xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 mb-1">
                                        {filterLabel || "Filter by Status"}
                                    </div>
                                    {OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleFilterSelect(option.value)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                                                activeFilter === option.value
                                                    ? "bg-primary/10 text-primary font-semibold"
                                                    : "text-foreground hover:bg-muted/50 font-medium"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    {activeFilter && (
                                        <button
                                            onClick={() => handleFilterSelect("")}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg mt-1 border-t border-border/30 pt-2 cursor-pointer font-medium"
                                        >
                                            <X className="h-3 w-3" />
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-card rounded-xl border border-border/50 shadow-xs overflow-hidden">
                {children}
            </div>
        </div>
    );
}

