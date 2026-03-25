"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { blogService } from "@/services/blog-service";
import { blogCategoryService, type BlogCategory } from "@/services/blog-category-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Image as ImageIcon, Save, Upload, X, Plus, ChevronDown, Tag } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";

export default function NewBlogPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bannerPreview, setBannerPreview] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // Category state
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            slug: "",
            banner: "",
            description: "",
            published: false,
            categoryId: "",
        },
    });

    // Fetch categories (silently fail if endpoint doesn't exist yet)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await blogCategoryService.getAll({ pageSize: 100 });
                setCategories(response.data || []);
            } catch {
                // API endpoint may not exist yet — silently ignore
            }
        };
        fetchCategories();
    }, []);

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("title", val);
        const autoSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setValue("slug", autoSlug);
    };

    // Handle banner file upload from device
    const handleBannerUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBannerFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                setBannerPreview(base64);
                setValue("banner", base64);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        },
        [setValue]
    );

    const removeBanner = useCallback(() => {
        setBannerFile(null);
        setBannerPreview("");
        setValue("banner", "");
    }, [setValue]);

    // Create a new category inline
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsCreatingCategory(true);
        try {
            const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            const newCat = await blogCategoryService.create({ name: newCategoryName.trim(), slug });
            setCategories((prev) => [...prev, newCat]);
            setSelectedCategory(newCat);
            setValue("categoryId", String(newCat.id));
            setNewCategoryName("");
            toast.success(`Category "${newCategoryName.trim()}" created!`);
        } catch (err) {
            console.error("Failed to create category:", err);
            toast.error("Failed to create category.");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const selectCategory = (cat: BlogCategory) => {
        setSelectedCategory(cat);
        setValue("categoryId", String(cat.id));
        setIsCatDropdownOpen(false);
    };

    const clearCategory = () => {
        setSelectedCategory(null);
        setValue("categoryId", "");
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: data.title,
                slug: data.slug,
                banner: data.banner,
                description: data.description,
                categoryId: data.categoryId ? Number(data.categoryId) : undefined,
                publishedAt: data.published ? new Date().toISOString() : null,
            };

            await blogService.create(payload);
            toast.success("Blog post created successfully!");
            router.push("/blogs");
        } catch (error) {
            console.error("Failed to create blog:", error);
            toast.error("Failed to create blog. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] w-full bg-background">
            {/* Header Toolbar */}
            <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/blogs")}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">New Blog Post</span>
                        <span className="text-[10px] font-medium text-muted-foreground">Draft</span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/blogs")}
                        className="h-8 px-3.5 text-xs font-semibold bg-transparent border-border/60 hover:bg-muted/50 rounded-lg"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="h-8 px-4 text-xs font-semibold shadow-sm bg-foreground text-background hover:bg-foreground/90 rounded-lg flex items-center gap-1.5"
                    >
                        {isSubmitting ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        Save & Publish
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex w-full">
                {/* Main Content Area (Left) */}
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                    {/* Title */}
                    <div className="px-8 pt-10 pb-2">
                        <input
                            type="text"
                            placeholder="Blog Title..."
                            {...register("title", { required: "Title is required" })}
                            onChange={handleTitleChange}
                            className="w-full bg-transparent border-none text-3xl sm:text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:ring-0 px-0 py-1"
                            style={{ boxShadow: "none" }}
                        />
                        {errors.title && (
                            <span className="text-xs font-medium text-destructive mt-1 block">
                                {errors.title.message as string}
                            </span>
                        )}
                    </div>

                    {/* Rich Text Editor */}
                    <div className="flex-1 flex flex-col px-8">
                        <Controller
                            control={control}
                            name="description"
                            rules={{ required: "Content is required" }}
                            render={({ field }) => (
                                <RichTextEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                    placeholder="Start writing your blog content..."
                                />
                            )}
                        />
                        {errors.description && (
                            <span className="text-xs font-medium text-destructive mt-1">
                                {errors.description.message as string}
                            </span>
                        )}
                    </div>
                </div>

                {/* Meta Sidebar (Right) */}
                <aside className="w-[320px] border-l border-border/40 bg-muted/5 p-5 flex flex-col gap-7 shrink-0 overflow-y-auto">
                    {/* Publishing */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Publishing
                        </h3>
                        <div className="p-3.5 bg-background border border-border/50 rounded-xl shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-[13px] font-semibold text-foreground">
                                        Publish Now
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                        Go live immediately
                                    </p>
                                </div>
                                <Controller
                                    control={control}
                                    name="published"
                                    render={({ field }) => (
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={field.value}
                                            onClick={() => field.onChange(!field.value)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                                                field.value
                                                    ? "bg-primary"
                                                    : "bg-muted-foreground/30"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${
                                                    field.value
                                                        ? "translate-x-4"
                                                        : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Category
                        </h3>

                        {/* Selected Category Tag */}
                        {selectedCategory && (
                            <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                                <Tag className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-semibold text-primary flex-1 truncate">
                                    {selectedCategory.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={clearCategory}
                                    className="h-5 w-5 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="h-3 w-3 text-primary/60" />
                                </button>
                            </div>
                        )}

                        {/* Dropdown Selector */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                className={cn(
                                    "w-full h-9 px-3 flex items-center justify-between text-sm rounded-lg border transition-colors cursor-pointer",
                                    isCatDropdownOpen
                                        ? "border-primary/40 bg-primary/5 text-foreground"
                                        : "border-border/50 bg-background text-muted-foreground hover:border-border"
                                )}
                            >
                                <span className={cn("truncate", selectedCategory ? "text-foreground font-medium" : "")}>
                                    {selectedCategory ? "Change category" : "Select category"}
                                </span>
                                <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isCatDropdownOpen && "rotate-180")} />
                            </button>

                            {isCatDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsCatDropdownOpen(false)} />
                                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-background border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* Create New */}
                                        <div className="p-2 border-b border-border/30">
                                            <div className="flex items-center gap-1.5">
                                                <Input
                                                    placeholder="New category name..."
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                                                    className="h-8 text-sm border-border/40 rounded-lg flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={handleCreateCategory}
                                                    disabled={!newCategoryName.trim() || isCreatingCategory}
                                                    className="h-8 w-8 p-0 bg-foreground text-background hover:bg-foreground/90 rounded-lg shrink-0"
                                                >
                                                    {isCreatingCategory ? (
                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                    ) : (
                                                        <Plus className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Category List */}
                                        <div className="max-h-48 overflow-y-auto p-1.5">
                                            {categories.length > 0 ? (
                                                categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => selectCategory(cat)}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2",
                                                            selectedCategory?.id === cat.id
                                                                ? "bg-primary/10 text-primary font-semibold"
                                                                : "text-foreground hover:bg-muted/50 font-medium"
                                                        )}
                                                    >
                                                        <Tag className="h-3 w-3 shrink-0 opacity-40" />
                                                        <span className="truncate">{cat.name}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                                    No categories yet. Create one above.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* URL Slug */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            SEO
                        </h3>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-semibold text-foreground">
                                URL Slug
                            </Label>
                            <Input
                                placeholder="auto-generated-slug"
                                {...register("slug", { required: "Slug is required" })}
                                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
                            />
                            {errors.slug && (
                                <span className="text-[10px] font-medium text-destructive">
                                    {errors.slug.message as string}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Featured Image
                        </h3>

                        {/* Upload Area */}
                        <div
                            onClick={() => bannerInputRef.current?.click()}
                            className="w-full aspect-[16/9] bg-muted/30 rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                        >
                            {bannerPreview ? (
                                <>
                                    <img
                                        src={bannerPreview}
                                        alt="Cover preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setBannerPreview("")}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-semibold">
                                            Change Image
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeBanner();
                                        }}
                                        className="absolute top-2 right-2 h-6 w-6 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                                    >
                                        <X className="h-3 w-3 text-foreground" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2 px-4 text-center">
                                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <Upload className="h-5 w-5 group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-muted-foreground/60">
                                        Click to upload cover image
                                    </span>
                                    <span className="text-[9px] text-muted-foreground/40">
                                        PNG, JPG, GIF up to 10MB
                                    </span>
                                </div>
                            )}
                        </div>

                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerUpload}
                        />

                        {/* Or paste URL */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-muted-foreground">
                                Or paste image URL
                            </Label>
                            <Input
                                placeholder="https://example.com/cover.jpg"
                                {...register("banner")}
                                onChange={(e) => {
                                    setValue("banner", e.target.value);
                                    setBannerPreview(e.target.value);
                                    setBannerFile(null);
                                }}
                                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
