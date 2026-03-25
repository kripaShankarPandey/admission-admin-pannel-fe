import { PageHeader } from "@/components/page-header";

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Help & Support"
                description="Find documentation and guides for managing the platform."
            />

            <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3 className="text-foreground">Need Help?</h3>
                <p>This admin panel allows you to manage colleges, blogs, and course categories for the Admission Today platform.</p>
            </div>
        </div>
    );
}
