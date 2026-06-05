"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CollegeForm } from "@/components/content-manager/college-form";
import { collegeService, College } from "@/services/college-service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Send, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EditCollegePageProps {
    params: Promise<{ id: string }>;
}

export default function EditCollegePage({ params }: EditCollegePageProps) {
    const router = useRouter();
    const { id } = use(params);
    const [college, setCollege] = useState<College | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollege = async () => {
            try {
                // id param now receives a slug (URL uses slug)
                const data = await collegeService.getBySlug(id);
                setCollege(data);
            } catch {
                // fallback: try numeric ID for backwards compat
                try {
                    const data = await collegeService.getOne(parseInt(id));
                    setCollege(data);
                } catch {
                    toast.error("Failed to fetch college");
                    router.push("/colleges");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCollege();
    }, [id, router]);

    const [isPublishing, setIsPublishing] = useState(false);

    const handleSave = async (data: Partial<College> & Record<string, unknown>) => {
        if (!college) return;
        try {
            const payload = { ...data };
            if (isPublishing) {
                payload.publishedAt = new Date().toISOString();
                setIsPublishing(false);
            }
            await collegeService.update(college.id, payload);
            toast.success(isPublishing ? "College published successfully" : "College updated successfully");
            router.push("/colleges");
        } catch (error) {
            console.error("Error saving college:", error);
            const errMsg = error && typeof error === "object" && "response" in error
                ? (error as any).response?.data?.message || "Failed to save college"
                : "Failed to save college";
            toast.error(Array.isArray(errMsg) ? errMsg.join(", ") : String(errMsg));
            setIsPublishing(false);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        submitForm();
    };

    const submitForm = () => {
        (document.getElementById("college-form") as HTMLFormElement | null)?.requestSubmit();
    };

    if (loading) {
        return (
            <div className="-m-6 min-h-[calc(100vh-3rem)] bg-muted/20">
                <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur px-5 py-4 lg:px-8">
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 space-y-6">
                    <Skeleton className="h-100 w-full rounded-lg" />
                    <Skeleton className="h-75 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (!college) return null;

    const isPublished = Boolean(college.publishedAt);

    return (
        <div className="-m-6 min-h-[calc(100vh-3rem)] bg-muted/20 animate-in fade-in duration-300">
            {/* Sticky header */}
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
                                <h1 className="text-xl font-semibold tracking-tight text-foreground truncate max-w-xs sm:max-w-sm">
                                    {college.college_name || "Edit College"}
                                </h1>
                                {isPublished ? (
                                    <Badge variant="outline" className="border-green-200 bg-green-50 px-2 py-0 text-[10px] font-bold uppercase text-green-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-orange-200 bg-orange-50 px-2 py-0 text-[10px] font-bold uppercase text-orange-600">
                                        <Clock className="mr-1 h-3 w-3" /> Draft
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Updated {new Date(college.updatedAt).toLocaleDateString()}
                                </span>
                                {college.slug && (
                                    <span className="font-mono opacity-60">/{college.slug}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-border/70 bg-background px-3 text-xs"
                            onClick={submitForm}
                        >
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 px-3 text-xs"
                            onClick={handlePublish}
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            {isPublished ? "Re-publish" : "Publish"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
                <CollegeForm initialData={college} onSave={handleSave} />
            </div>
        </div>
    );
}
