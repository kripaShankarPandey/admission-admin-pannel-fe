"use client";

import { useRouter } from "next/navigation";
import { CollegeForm } from "@/components/content-manager/college-form";
import { collegeService, type College } from "@/services/college-service";
import { toast } from "sonner";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getApiErrorMessage(error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
        const response = (
            error as {
                response?: { data?: { message?: string | string[] } };
            }
        ).response;
        const message = response?.data?.message;

        if (Array.isArray(message)) return message.join(", ");
        if (message) return message;
    }

    return "Failed to create college";
}

export default function CreateCollegePage() {
    const router = useRouter();

    const handleSave = async (data: Partial<College> & Record<string, unknown>) => {
        try {
            await collegeService.create(data);
            toast.success("College created successfully");
            router.push("/colleges");
        } catch (error) {
            console.error("Error creating college:", error);
            toast.error(getApiErrorMessage(error));
        }
    };

    const submitCollegeForm = () => {
        (document.getElementById("college-form") as HTMLFormElement | null)?.requestSubmit();
    };

    return (
        <div className="-m-6 min-h-[calc(100vh-3rem)] bg-muted/20 animate-in fade-in duration-300">
            <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex min-w-0 items-start gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/colleges")}
                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    Create College
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="border-orange-200 bg-orange-50 px-2 py-0 text-[10px] font-bold uppercase text-orange-600"
                                >
                                    Draft
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                College profile, courses, hospital data, cutoffs, and labs
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-border/70 bg-background px-3 text-xs"
                            onClick={submitCollegeForm}
                        >
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 px-3 text-xs"
                            onClick={() => {
                                toast.info("Publishing will save and mark as published");
                                submitCollegeForm();
                            }}
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
                <CollegeForm onSave={handleSave} />
            </div>
        </div>
    );
}
