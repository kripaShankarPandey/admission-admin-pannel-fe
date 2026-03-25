"use client";

import { useRouter } from "next/navigation";
import { CollegeForm } from "@/components/content-manager/college-form";
import { collegeService } from "@/services/college-service";
import { toast } from "sonner";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CreateCollegePage() {
    const router = useRouter();

    const handleSave = async (data: any) => {
        try {
            await collegeService.create(data);
            toast.success("College created successfully");
            router.push("/colleges");
        } catch (error) {
            console.error("Error creating college:", error);
            toast.error("Failed to create college");
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/colleges")}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Create College</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 py-0 px-1.5">
                                    Draft
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">Fill in the details below</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-background border-border/60"
                            onClick={() => document.querySelector("form")?.requestSubmit()}
                        >
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => {
                                toast.info("Publishing will save and mark as published");
                                document.querySelector("form")?.requestSubmit();
                            }}
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Form Content ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <CollegeForm onSave={handleSave} />
                </div>
            </div>
        </div>
    );
}
