"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";

const MAX_CATEGORIES = 12;
const MAX_POPULAR_COURSES = 4;
const MAX_TOP_COLLEGES = 4;

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

export default function HomeSettingsPage() {
  const [settings, setSettings] = useState<Partial<HomePageSettings>>({
    banner: [],
    runningText: [],
    categories: [],
    popularCourses: [],
    topColleges: [],
    reviews: [],
  });
  const [disciplineOptions, setDisciplineOptions] = useState<CourseCategory[]>([]);
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
        reviews: Array.isArray(homeSettings.reviews) ? homeSettings.reviews : [],
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
      toast.success("HOME settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update HOME settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateArrayItem = <T,>(
    key:
      | "banner"
      | "runningText"
      | "reviews"
      | "categories"
      | "popularCourses"
      | "topColleges",
    index: number,
    value: T,
  ) => {
    const current = [...((settings[key] as T[] | undefined) || [])];
    current[index] = value;
    setSettings({ ...settings, [key]: current });
  };

  const removeArrayItem = (
    key:
      | "banner"
      | "runningText"
      | "reviews"
      | "categories"
      | "popularCourses"
      | "topColleges",
    index: number,
  ) => {
    const current = [...((settings[key] as unknown[] | undefined) || [])];
    current.splice(index, 1);
    setSettings({ ...settings, [key]: current });
  };

  const addRunningText = () => {
    const runningText = settings.runningText || [];
    setSettings({ ...settings, runningText: [...runningText, emptyRunningText()] });
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
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

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading HOME settings...</div>;
  }

  const selectedCategories = (settings.categories || []) as HomeSelectionItem[];
  const selectedPopularCourses = (settings.popularCourses ||
    []) as HomeSelectionItem[];
  const selectedTopColleges = (settings.topColleges || []) as HomeSelectionItem[];

  const availableCategoryOptions = disciplineOptions.filter(
    (item) =>
      !selectedCategories.some((selected) => selected.id === item.id) &&
      item.courses_category_name
        .toLowerCase()
        .includes(categorySearch.toLowerCase()),
  );
  const availablePopularCourseOptions = popularCourseOptions.filter(
    (item) =>
      !selectedPopularCourses.some((selected) => selected.id === item.id) &&
      item.sub_course_category_name
        .toLowerCase()
        .includes(courseSearch.toLowerCase()),
  );
  const availableTopCollegeOptions = topCollegeOptions.filter(
    (item) =>
      !selectedTopColleges.some((selected) => selected.id === item.id) &&
      item.college_name.toLowerCase().includes(collegeSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="HOME"
        description="Manage running text, banners, featured homepage selections, and reviews."
        action={{
          label: isSaving ? "Saving..." : "Save HOME",
          onClick: handleSave,
        }}
      />

      <div className="grid gap-6">
        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Running Text</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addRunningText}
                className="bg-background border-border text-foreground hover:bg-muted/40"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </div>

            <div className="space-y-4">
              {(settings.runningText || []).map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border/50 rounded-lg bg-muted/50 space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeArrayItem("runningText", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Text</Label>
                      <Input
                        value={item.text}
                        onChange={(event) =>
                          updateArrayItem("runningText", index, {
                            ...item,
                            text: event.target.value,
                          })
                        }
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Featured</Label>
                      <Select
                        value={item.featured ? "Yes" : "No"}
                        onValueChange={(value) =>
                          updateArrayItem("runningText", index, {
                            ...item,
                            featured: value === "Yes",
                          })
                        }
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Banner</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addBanner}
                className="bg-background border-border text-foreground hover:bg-muted/40"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>

            <div className="space-y-4">
              {(settings.banner || []).map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border/50 rounded-lg bg-muted/50 space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeArrayItem("banner", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Image Title</Label>
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          updateArrayItem("banner", index, {
                            ...item,
                            title: event.target.value,
                          })
                        }
                        placeholder="Enter banner title"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Image</Label>
                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-3 text-sm text-muted-foreground hover:bg-muted/40">
                        <ImagePlus className="h-4 w-4" />
                        Upload Banner Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleBannerImageUpload(index, event)}
                        />
                      </label>
                    </div>
                  </div>

                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title || `Banner ${index + 1}`}
                      className="h-40 w-full rounded-lg object-cover border border-border/40"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Category</h3>
                <p className="text-sm text-muted-foreground">
                  Select up to {MAX_CATEGORIES} disciplines from the Discipline data.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Search discipline"
                  className="bg-background border-border text-foreground"
                />
                <Select
                  value={selectedCategoryToAdd}
                  onValueChange={(value) => {
                    setSelectedCategoryToAdd(value);
                    const selected = disciplineOptions.find(
                      (item) => item.id.toString() === value,
                    );
                    if (!selected) return;
                    addSelectionItem(
                      "categories",
                      {
                        id: selected.id,
                        name: selected.courses_category_name,
                      },
                      MAX_CATEGORIES,
                    );
                    setSelectedCategoryToAdd("");
                  }}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Add discipline" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {availableCategoryOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.courses_category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((item, index) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="bg-background border-border flex items-center gap-2 py-1.5 px-3"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("categories", index)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Popular Course</h3>
                <p className="text-sm text-muted-foreground">
                  Select up to {MAX_POPULAR_COURSES} courses from the Courses data.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Input
                  value={courseSearch}
                  onChange={(event) => setCourseSearch(event.target.value)}
                  placeholder="Search course"
                  className="bg-background border-border text-foreground"
                />
                <Select
                  value={selectedCourseToAdd}
                  onValueChange={(value) => {
                    setSelectedCourseToAdd(value);
                    const selected = popularCourseOptions.find(
                      (item) => item.id.toString() === value,
                    );
                    if (!selected) return;
                    addSelectionItem(
                      "popularCourses",
                      {
                        id: selected.id,
                        name: selected.sub_course_category_name,
                      },
                      MAX_POPULAR_COURSES,
                    );
                    setSelectedCourseToAdd("");
                  }}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Add popular course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {availablePopularCourseOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.sub_course_category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedPopularCourses.map((item, index) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="bg-background border-border flex items-center gap-2 py-1.5 px-3"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("popularCourses", index)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top College</h3>
                <p className="text-sm text-muted-foreground">
                  Select up to {MAX_TOP_COLLEGES} colleges from the College data.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Input
                  value={collegeSearch}
                  onChange={(event) => setCollegeSearch(event.target.value)}
                  placeholder="Search college"
                  className="bg-background border-border text-foreground"
                />
                <Select
                  value={selectedCollegeToAdd}
                  onValueChange={(value) => {
                    setSelectedCollegeToAdd(value);
                    const selected = topCollegeOptions.find(
                      (item) => item.id.toString() === value,
                    );
                    if (!selected) return;
                    addSelectionItem(
                      "topColleges",
                      {
                        id: selected.id,
                        name: selected.college_name,
                      },
                      MAX_TOP_COLLEGES,
                    );
                    setSelectedCollegeToAdd("");
                  }}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Add top college" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {availableTopCollegeOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedTopColleges.map((item, index) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="bg-background border-border flex items-center gap-2 py-1.5 px-3"
                >
                  {item.name}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("topColleges", index)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Review</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addReview}
                className="bg-background border-border text-foreground hover:bg-muted/40"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </div>

            <div className="space-y-4">
              {(settings.reviews || []).map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border/50 rounded-lg bg-muted/50 space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeArrayItem("reviews", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Review</Label>
                    <Textarea
                      value={item.review}
                      onChange={(event) =>
                        updateArrayItem("reviews", index, {
                          ...item,
                          review: event.target.value,
                        })
                      }
                      placeholder="Enter review"
                      className="bg-background border-border text-foreground min-h-[110px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Name</Label>
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          updateArrayItem("reviews", index, {
                            ...item,
                            name: event.target.value,
                          })
                        }
                        placeholder="Reviewer name"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Position</Label>
                      <Input
                        value={item.position}
                        onChange={(event) =>
                          updateArrayItem("reviews", index, {
                            ...item,
                            position: event.target.value,
                          })
                        }
                        placeholder="Reviewer position"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
