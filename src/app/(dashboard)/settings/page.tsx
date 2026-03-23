import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Global Settings"
                description="Manage site-wide configuration, SEO, and contact details."
            />

            <Card className="bg-muted/10 border-white/10 shadow-none">
                <CardContent className="p-6 space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">Site Name</label>
                        <Input placeholder="Enter site name" defaultValue="Admission Today" className="bg-muted/20 border-white/10 text-white" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-white">Site Description</label>
                        <Input placeholder="Enter meta description" className="bg-muted/20 border-white/10 text-white" />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-white">Save Settings</Button>
                </CardContent>
            </Card>
        </div>
    );
}
