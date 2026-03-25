"use client";

import * as React from "react";
import { ArrowLeft, Save, Send, Trash2, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DetailsLayoutProps {
    title: string;
    subtitle?: string;
    status?: "draft" | "published";
    onBack?: () => void;
    onSave?: () => void;
    onPublish?: () => void;
    onDelete?: () => void;
    info?: {
        id?: string | number;
        createdAt?: string;
        updatedAt?: string;
    };
    children: React.ReactNode;
}

export function DetailsLayout({
    title,
    subtitle,
    status = "draft",
    onBack,
    onSave,
    onPublish,
    onDelete,
    info,
    children
}: DetailsLayoutProps) {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="-ml-2 h-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                            {status === "published" ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 py-0.5 px-2.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Published
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1.5 py-0.5 px-2.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Draft
                                </Badge>
                            )}
                        </div>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        {onDelete && (
                            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                        <Button variant="outline" onClick={onSave} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                            Save
                        </Button>
                        <Button onClick={onPublish} className="bg-primary hover:bg-primary/90 text-foreground font-semibold">
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-6">
                        {children}
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4 space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Information</h3>
                        <div className="space-y-3">
                            {info?.id && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground/50">ID</span>
                                    <span className="text-sm font-medium">{info.id}</span>
                                </div>
                            )}
                            {info?.createdAt && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground/50">Created At</span>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        {new Date(info.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            )}
                            {info?.updatedAt && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground/50">Last Update</span>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {new Date(info.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
