"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ImagePlus,
  Megaphone,
  MessageSquareQuote,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  homePageService,
  type HomeBannerItem,
  type HomePageSettings,
  type HomeReviewItem,
  type HomeRunningTextItem,
  type HomeSelectionItem,
} from "@/services/home-page-service";
import {
  courseCategoryService,
  type CourseCategory,
} from "@/services/course-category-service";
import {
  subCourseCategoryService,
  type SubCourseCategory,
} from "@/services/sub-course-category-service";
import { collegeService, type College } from "@/services/college-service";
import { cn } from "@/lib/utils";

const MAX_CATEGORIES = 12;
const MAX_POPULAR_COURSES = 4;
const MAX_TOP_COLLEGES = 4;

type ArrayKey =
  | "banner"
  | "runningText"
  | "reviews"
  | "categories"
  | "popularCourses"
  | "topColleges";

const emptyRunningText = (): HomeRunningTextItem => ({
  text: "",
  featured: false,
});

const emptyBanner = (): HomeBannerItem => ({
  title: "",
  image: "",
});

const emptyReview = (): HomeReviewItem => ({
  review: "",
  name: "",
  position: "",
});

function SectionShell({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-primary">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {description}
            </CardDescription>
          </div>
        </div>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm font-medium text-muted-foreground">
      {label}
    </div>
  );
}

function SelectionEditor({
  title,
  description,
  icon,
  limit,
  search,
  onSearchChange,
  selectValue,
  onSelect,
  selectPlaceholder,
  options,
  selected,
  onRemove,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  limit: number;
  search: string;
  onSearchChange: (value: string) => void;
  selectValue: string;
  onSelect: (value: string) => void;
  selectPlaceholder: string;
  options: HomeSelectionItem[];
  selected: HomeSelectionItem[];
  onRemove: (index: number) => void;
}) {
  return (
    <SectionShell
      title={title}
      description={description}
      icon={icon}
      action={
        <Badge variant="outline" className="rounded-md border-border/60">
          {selected.length}/{limit}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
              className="h-10 pl-9"
            />
          </div>
          <Select value={selectValue} onValueChange={onSelect}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {options.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No matching items
                </div>
              ) : (
                options.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-28 rounded-lg border border-border/60 bg-background p-4">
          {selected.length === 0 ? (
            <EmptyState label="No items selected yet." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((item, index) => (
                <Badge
                  key={`${item.id}-${index}`}
                  variant="outline"
                  className="gap-2 rounded-lg border-border/60 bg-card px-3 py-1.5"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

export default function HomeSettingsPage() {
  const [settings, setSettings] = useState<Partial<HomePageSettings>>({
    banner: [],
    runningText: [],
    categories: [],
    popularCourses: [],
    topColleges: [],
    reviews: [],
  });
  const [disciplineOptions, setDisciplineOptions] = useState<CourseCategory[]>(
    [],
  );
  const [popularCourseOptions, setPopularCourseOptions] = useState<
    SubCourseCategory[]
  >([]);
  const [topCollegeOptions, setTopCollegeOptions] = useState<College[]>([]);
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState("");
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState("");
  const [selectedCollegeToAdd, setSelectedCollegeToAdd] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const [homeSettings, categoriesRes, coursesRes, collegesRes] =
        await Promise.all([
          homePageService.getSettings(),
          courseCategoryService.getAll({ page: 1, pageSize: 100 }),
          subCourseCategoryService.getAll({ page: 1, pageSize: 100 }),
          collegeService.getAll({ page: 1, pageSize: 100 }),
        ]);

      setSettings({
        ...homeSettings,
        banner: Array.isArray(homeSettings.banner) ? homeSettings.banner : [],
        runningText: Array.isArray(homeSettings.runningText)
          ? homeSettings.runningText
          : [],
        categories: Array.isArray(homeSettings.categories)
          ? homeSettings.categories
          : [],
        popularCourses: Array.isArray(homeSettings.popularCourses)
          ? homeSettings.popularCourses
          : [],
        topColleges: Array.isArray(homeSettings.topColleges)
          ? homeSettings.topColleges
          : [],
        reviews: Array.isArray(homeSettings.reviews)
          ? homeSettings.reviews
          : [],
      });

      setDisciplineOptions(categoriesRes.data || []);
      setPopularCourseOptions(coursesRes.data || []);
      setTopCollegeOptions(collegesRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load home settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await homePageService.updateSettings(settings);
      toast.success("Home settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update home settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateArrayItem = <T,>(key: ArrayKey, index: number, value: T) => {
    const current = [...((settings[key] as T[] | undefined) || [])];
    current[index] = value;
    setSettings({ ...settings, [key]: current });
  };

  const removeArrayItem = (key: ArrayKey, index: number) => {
    const current = [...((settings[key] as unknown[] | undefined) || [])];
    current.splice(index, 1);
    setSettings({ ...settings, [key]: current });
  };

  const addRunningText = () => {
    const runningText = settings.runningText || [];
    setSettings({
      ...settings,
      runningText: [...runningText, emptyRunningText()],
    });
  };

  const addBanner = () => {
    const banner = settings.banner || [];
    setSettings({ ...settings, banner: [...banner, emptyBanner()] });
  };

  const addReview = () => {
    const reviews = settings.reviews || [];
    setSettings({ ...settings, reviews: [...reviews, emptyReview()] });
  };

  const handleBannerImageUpload = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const banner = [...(settings.banner || [])];
      banner[index] = {
        ...banner[index],
        image: reader.result as string,
      };
      setSettings({ ...settings, banner });
    };
    reader.readAsDataURL(file);
  };

  const addSelectionItem = (
    key: "categories" | "popularCourses" | "topColleges",
    item: HomeSelectionItem,
    limit: number,
  ) => {
    const current = (settings[key] || []) as HomeSelectionItem[];
    if (current.some((entry) => entry.id === item.id)) {
      toast.info("This item is already selected.");
      return;
    }
    if (current.length >= limit) {
      toast.error(`You can only select up to ${limit} items here.`);
      return;
    }
    setSettings({
      ...settings,
      [key]: [...current, item],
    });
  };

  const selectedCategories = useMemo(
    () => (settings.categories || []) as HomeSelectionItem[],
    [settings.categories],
  );
  const selectedPopularCourses = useMemo(
    () => (settings.popularCourses || []) as HomeSelectionItem[],
    [settings.popularCourses],
  );
  const selectedTopColleges = useMemo(
    () => (settings.topColleges || []) as HomeSelectionItem[],
    [settings.topColleges],
  );
  const bannerItems = useMemo(
    () => settings.banner || [],
    [settings.banner],
  );
  const runningTextItems = useMemo(
    () => settings.runningText || [],
    [settings.runningText],
  );
  const reviewItems = useMemo(
    () => settings.reviews || [],
    [settings.reviews],
  );

  const availableCategoryOptions = useMemo(
    () =>
      disciplineOptions
        .filter(
          (item) =>
            !selectedCategories.some((selected) => selected.id === item.id) &&
            item.courses_category_name
              .toLowerCase()
              .includes(categorySearch.toLowerCase()),
        )
        .map((item) => ({ id: item.id, name: item.courses_category_name })),
    [categorySearch, disciplineOptions, selectedCategories],
  );

  const availablePopularCourseOptions = useMemo(
    () =>
      popularCourseOptions
        .filter(
          (item) =>
            !selectedPopularCourses.some(
              (selected) => selected.id === item.id,
            ) &&
            item.sub_course_category_name
              .toLowerCase()
              .includes(courseSearch.toLowerCase()),
        )
        .map((item) => ({ id: item.id, name: item.sub_course_category_name })),
    [courseSearch, popularCourseOptions, selectedPopularCourses],
  );

  const availableTopCollegeOptions = useMemo(
    () =>
      topCollegeOptions
        .filter(
          (item) =>
            !selectedTopColleges.some((selected) => selected.id === item.id) &&
            item.college_name.toLowerCase().includes(collegeSearch.toLowerCase()),
        )
        .map((item) => ({ id: item.id, name: item.college_name })),
    [collegeSearch, selectedTopColleges, topCollegeOptions],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-sm font-medium text-muted-foreground">
        Loading home settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="sticky top-0 z-20 -mx-6 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Home Settings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Control homepage banners, marquee text, featured selections, and
                reviews.
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Home"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Banners", bannerItems.length],
          ["Running Text", runningTextItems.length],
          ["Categories", selectedCategories.length],
          ["Courses", selectedPopularCourses.length],
          ["Reviews", reviewItems.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-border/50 bg-card p-4 shadow-xs"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {value}
            </div>
          </div>
        ))}
      </div>

      <SectionShell
        title="Running Text"
        description="Short announcements shown in the homepage marquee."
        icon={Megaphone}
        action={
          <Button variant="outline" size="sm" onClick={addRunningText}>
            <Plus className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        }
      >
        {runningTextItems.length === 0 ? (
          <EmptyState label="No running text added yet." />
        ) : (
          <div className="space-y-3">
            {runningTextItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-lg border border-border/60 bg-background p-4 lg:grid-cols-[1fr_180px_40px]"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Text
                  </Label>
                  <Input
                    value={item.text}
                    onChange={(event) =>
                      updateArrayItem("runningText", index, {
                        ...item,
                        text: event.target.value,
                      })
                    }
                    placeholder="Admission alerts, deadlines, or updates"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Featured
                  </Label>
                  <Select
                    value={item.featured ? "Yes" : "No"}
                    onValueChange={(value) =>
                      updateArrayItem("runningText", index, {
                        ...item,
                        featured: value === "Yes",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Featured?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="self-end text-destructive hover:text-destructive"
                  onClick={() => removeArrayItem("runningText", index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell
        title="Hero Banners"
        description="Upload homepage banner images and set concise titles."
        icon={ImagePlus}
        action={
          <Button variant="outline" size="sm" onClick={addBanner}>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        }
      >
        {bannerItems.length === 0 ? (
          <EmptyState label="No banners added yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {bannerItems.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-border/60 bg-background"
              >
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[180px_1fr_40px]">
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-dashed border-border/70 bg-muted/20">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title || `Banner ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Image Title
                      </Label>
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          updateArrayItem("banner", index, {
                            ...item,
                            title: event.target.value,
                          })
                        }
                        placeholder="Banner title"
                      />
                    </div>
                    <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-card text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                      <ImagePlus className="h-4 w-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleBannerImageUpload(index, event)
                        }
                      />
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeArrayItem("banner", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      <SelectionEditor
        title="Homepage Categories"
        description={`Select up to ${MAX_CATEGORIES} disciplines to feature.`}
        icon={Star}
        limit={MAX_CATEGORIES}
        search={categorySearch}
        onSearchChange={setCategorySearch}
        selectValue={selectedCategoryToAdd}
        onSelect={(value) => {
          setSelectedCategoryToAdd(value);
          const selected = disciplineOptions.find(
            (item) => item.id.toString() === value,
          );
          if (!selected) return;
          addSelectionItem(
            "categories",
            { id: selected.id, name: selected.courses_category_name },
            MAX_CATEGORIES,
          );
          setSelectedCategoryToAdd("");
        }}
        selectPlaceholder="Add discipline"
        options={availableCategoryOptions}
        selected={selectedCategories}
        onRemove={(index) => removeArrayItem("categories", index)}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SelectionEditor
          title="Popular Courses"
          description={`Select up to ${MAX_POPULAR_COURSES} courses.`}
          icon={BookOpen}
          limit={MAX_POPULAR_COURSES}
          search={courseSearch}
          onSearchChange={setCourseSearch}
          selectValue={selectedCourseToAdd}
          onSelect={(value) => {
            setSelectedCourseToAdd(value);
            const selected = popularCourseOptions.find(
              (item) => item.id.toString() === value,
            );
            if (!selected) return;
            addSelectionItem(
              "popularCourses",
              { id: selected.id, name: selected.sub_course_category_name },
              MAX_POPULAR_COURSES,
            );
            setSelectedCourseToAdd("");
          }}
          selectPlaceholder="Add course"
          options={availablePopularCourseOptions}
          selected={selectedPopularCourses}
          onRemove={(index) => removeArrayItem("popularCourses", index)}
        />

        <SelectionEditor
          title="Top Colleges"
          description={`Select up to ${MAX_TOP_COLLEGES} colleges.`}
          icon={Building2}
          limit={MAX_TOP_COLLEGES}
          search={collegeSearch}
          onSearchChange={setCollegeSearch}
          selectValue={selectedCollegeToAdd}
          onSelect={(value) => {
            setSelectedCollegeToAdd(value);
            const selected = topCollegeOptions.find(
              (item) => item.id.toString() === value,
            );
            if (!selected) return;
            addSelectionItem(
              "topColleges",
              { id: selected.id, name: selected.college_name },
              MAX_TOP_COLLEGES,
            );
            setSelectedCollegeToAdd("");
          }}
          selectPlaceholder="Add college"
          options={availableTopCollegeOptions}
          selected={selectedTopColleges}
          onRemove={(index) => removeArrayItem("topColleges", index)}
        />
      </div>

      <SectionShell
        title="Reviews"
        description="Student or parent testimonials shown on the homepage."
        icon={MessageSquareQuote}
        action={
          <Button variant="outline" size="sm" onClick={addReview}>
            <Plus className="mr-2 h-4 w-4" />
            Add Review
          </Button>
        }
      >
        {reviewItems.length === 0 ? (
          <EmptyState label="No reviews added yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {reviewItems.map((item, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border border-border/60 bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="border-border/60">
                    Review {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeArrayItem("reviews", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Review
                  </Label>
                  <Textarea
                    value={item.review}
                    onChange={(event) =>
                      updateArrayItem("reviews", index, {
                        ...item,
                        review: event.target.value,
                      })
                    }
                    placeholder="Write the testimonial..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Name
                    </Label>
                    <Input
                      value={item.name}
                      onChange={(event) =>
                        updateArrayItem("reviews", index, {
                          ...item,
                          name: event.target.value,
                        })
                      }
                      placeholder="Reviewer name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Position
                    </Label>
                    <Input
                      value={item.position}
                      onChange={(event) =>
                        updateArrayItem("reviews", index, {
                          ...item,
                          position: event.target.value,
                        })
                      }
                      placeholder="Student, Parent, Counselor"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionShell>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={cn("gap-2 shadow-lg", isSaving && "opacity-80")}
        >
          {isSaving ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Home Settings"}
        </Button>
      </div>
    </div>
  );
}
