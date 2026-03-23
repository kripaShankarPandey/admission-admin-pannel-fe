"use client";

import { useRouter } from "next/navigation";
import { DetailsLayout } from "@/components/content-manager/details-layout";
import { CollegeForm } from "@/components/content-manager/college-form";
import { collegeService } from "@/services/college-service";
import { toast } from "sonner";

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
        <DetailsLayout
            title="Create an entry"
            subtitle="Draft"
            onBack={() => router.push("/colleges")}
            onSave={() => {
                // The form submission is handled inside CollegeForm via a hidden button or direct ref call
                // But for now, we'll trigger it using a custom event or just relying on the form's own submit button
                // In a real Strapi UI, the Save button is in the header.
                // We'll need to link the header button to the form submit.
                document.querySelector("form")?.requestSubmit();
            }}
            onPublish={async () => {
                // Similar to Save, but with status updated to 'published'
                // This would require updating the data with publishedAt before saving
                toast.info("Publishing is not yet fully implemented in this demo.");
                document.querySelector("form")?.requestSubmit();
            }}
        >
            <CollegeForm onSave={handleSave} />
        </DetailsLayout>
    );
}
