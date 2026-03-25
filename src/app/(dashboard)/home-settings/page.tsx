"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homePageService, type HomePageSettings } from "@/services/home-page-service";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

export default function HomeSettingsPage() {
    const [settings, setSettings] = useState<Partial<HomePageSettings>>({
        banner: [],
        runningText: [],
        seoData: { metaTitle: "", metaDescription: "" }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await homePageService.getSettings();
            setSettings({
                ...data,
                banner: data.banner || [],
                runningText: data.runningText || [],
                seoData: data.seoData || { metaTitle: "", metaDescription: "" }
            });
        } catch (error) {
            toast.error("Failed to load settings.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await homePageService.updateSettings(settings);
            toast.success("Settings updated successfully.");
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const addBanner = () => {
        const banner = settings.banner || [];
        setSettings({ ...settings, banner: [...banner, { title: "", image: "", link: "" }] });
    };

    const removeBanner = (index: number) => {
        const banner = [...(settings.banner || [])];
        banner.splice(index, 1);
        setSettings({ ...settings, banner });
    };

    const updateBanner = (index: number, field: string, value: string) => {
        const banner = [...(settings.banner || [])];
        banner[index] = { ...banner[index], [field]: value };
        setSettings({ ...settings, banner });
    };

    const addRunningText = () => {
        const rt = settings.runningText || [];
        setSettings({ ...settings, runningText: [...rt, { text: "", link: "" }] });
    };

    const removeRunningText = (index: number) => {
        const rt = [...(settings.runningText || [])];
        rt.splice(index, 1);
        setSettings({ ...settings, runningText: rt });
    };

    const updateRunningText = (index: number, field: string, value: string) => {
        const rt = [...(settings.runningText || [])];
        rt[index] = { ...rt[index], [field]: value };
        setSettings({ ...settings, runningText: rt });
    };

    if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Home Page Configuration"
                description="Manage banners, running text, and SEO settings for the home page."
                action={{ label: "Save All Changes", onClick: handleSave }}
            />

            <div className="grid gap-6">
                {/* Banners Section */}
                <Card className="bg-card border-border shadow-none">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Carousel Banners</h3>
                            <Button variant="outline" size="sm" onClick={addBanner} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                                <Plus className="h-4 w-4 mr-2" /> Add Banner
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(settings.banner || []).map((b, i) => (
                                <div key={i} className="p-4 border border-border/50 rounded-lg space-y-3 bg-muted/50 relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeBanner(i)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Title</Label>
                                            <Input value={b.title} onChange={e => updateBanner(i, "title", e.target.value)} placeholder="Banner Title" className="bg-background border-border text-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Image URL</Label>
                                            <Input value={b.image} onChange={e => updateBanner(i, "image", e.target.value)} placeholder="https://..." className="bg-background border-border text-foreground" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-muted-foreground">Link</Label>
                                            <Input value={b.link} onChange={e => updateBanner(i, "link", e.target.value)} placeholder="/colleges/..." className="bg-background border-border text-foreground" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Running Text Section */}
                <Card className="bg-card border-border shadow-none">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Running Flash Text</h3>
                            <Button variant="outline" size="sm" onClick={addRunningText} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                                <Plus className="h-4 w-4 mr-2" /> Add Text
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(settings.runningText || []).map((rt, i) => (
                                <div key={i} className="flex gap-2 items-end p-4 border border-border/50 rounded-lg bg-muted/50">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-muted-foreground">Display Text</Label>
                                        <Input value={rt.text} onChange={e => updateRunningText(i, "text", e.target.value)} className="bg-background border-border text-foreground" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-muted-foreground">Action Link</Label>
                                        <Input value={rt.link} onChange={e => updateRunningText(i, "link", e.target.value)} className="bg-background border-border text-foreground" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeRunningText(i)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Section */}
                <Card className="bg-card border-border shadow-none">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Home SEO Metadata</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Meta Title</Label>
                                <Input
                                    value={settings.seoData?.metaTitle || ""}
                                    onChange={e => setSettings({ ...settings, seoData: { ...settings.seoData, metaTitle: e.target.value } })}
                                    className="bg-background border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Meta Description</Label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                    value={settings.seoData?.metaDescription || ""}
                                    onChange={e => setSettings({ ...settings, seoData: { ...settings.seoData, metaDescription: e.target.value } })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
