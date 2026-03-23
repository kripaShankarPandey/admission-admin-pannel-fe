"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DetailsLayout } from "@/components/content-manager/details-layout";
import { CollegeForm } from "@/components/content-manager/college-form";
import { collegeService, College } from "@/services/college-service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
                const data = await collegeService.getOne(parseInt(id));
                setCollege(data);
            } catch (error) {
                console.error("Error fetching college:", error);
                toast.error("Failed to fetch college");
                router.push("/colleges");
            } finally {
                setLoading(false);
            }
        };

        fetchCollege();
    }, [id, router]);

    const handleSave = async (data: any) => {
        try {
            await collegeService.update(parseInt(id), data);
            toast.success("College updated successfully");
            router.push("/colleges");
        } catch (error) {
            console.error("Error updating college:", error);
            toast.error("Failed to update college");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Skeleton className="lg:col-span-3 h-[600px]" />
                    <Skeleton className="lg:col-span-1 h-[400px]" />
                </div>
            </div>
        );
    }

    if (!college) return null;

    return (
        <DetailsLayout
            title={college.college_name || "Edit College"}
            subtitle={college.publishedAt ? "Published" : "Draft"}
            status={college.publishedAt ? "published" : "draft"}
            onBack={() => router.push("/colleges")}
            onSave={() => {
                document.querySelector("form")?.requestSubmit();
            }}
            onPublish={async () => {
                // Similarly to create, this would involve status update
                toast.info("Publishing is not yet fully implemented in this demo.");
                document.querySelector("form")?.requestSubmit();
            }}
            info={{
                id: college.id,
                createdAt: college.createdAt,
                updatedAt: college.updatedAt
            }}
        >
            <CollegeForm initialData={college} onSave={handleSave} />
        </DetailsLayout>
    );
}
