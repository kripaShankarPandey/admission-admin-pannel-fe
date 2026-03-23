"use client";

import * as React from "react";
import { Plus, Search, Filter, MoreHorizontal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ListingLayoutProps {
    title: string;
    count?: number;
    onCreateClick?: () => void;
    onSearchChange?: (value: string) => void;
    onFilterClick?: () => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export function ListingLayout({
    title,
    count,
    onCreateClick,
    onSearchChange,
    onFilterClick,
    actions,
    children
}: ListingLayoutProps) {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    {count !== undefined && (
                        <p className="text-sm text-muted-foreground font-medium">{count} entries found</p>
                    )}
                </div>
                {onCreateClick && (
                    <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                        <Plus className="mr-2 h-4 w-4" />
                        Create new entry
                    </Button>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="pl-9 bg-muted/20 border-white/10 ring-offset-background focus-visible:ring-1 focus-visible:ring-primary text-white placeholder:text-[#a5a5ba]"
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                    <Button variant="outline" size="sm" onClick={onFilterClick} className="bg-muted/20 border-white/10 text-white hover:bg-muted/40 hover:text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-muted/10 rounded-lg border border-white/10 shadow-sm overflow-hidden">
                {children}
            </div>
        </div>
    );
}
