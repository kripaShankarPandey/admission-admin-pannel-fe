"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2, Upload } from "lucide-react";
import type {
    College,
    CollegeBulkUploadResult,
    CollegeQueryParams,
} from "@/services/college-service";
import { collegeService } from "@/services/college-service";
import { cityService } from "@/services/city-service";
import { courseCategoryService } from "@/services/course-category-service";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

const COLLEGE_IMPORT_HEADERS = [
    "college_name",
    "slug",
    "NIRF_rank",
    "established_year",
    "college_description",
    "college_type",
    "state",
    "city_name",
    "mgmt_type",
    "approval",
    "status",
    "affiliated_with",
    "campus_area",
    "naac",
    "nba",
    "priority",
    "isFeatured",
    "college_rating",
    "college_image",
    "gallery",
    "campus_tour_icon",
    "podcast",
    "meta_title",
    "meta_description",
    "keywords",
    "admission_counselling",
    "eligibility",
    "exam_accepted",
    "internship",
    "exchange_program",
    "sponsorship",
    "stipend_year_1",
    "stipend_year_2",
    "stipend_year_3",
    "hospital_bed",
    "no_of_ot",
    "airport",
    "railway_station",
    "bus_stand",
    "total_bed",
    "ss_bed",
    "ms_bed",
    "opd_running",
    "average_ot",
    "clinical_rotation",
    "medical_camping",
    "courses",
    "add_on_facilities",
    "clinical_excilence_lab",
];

const COLLEGE_IMPORT_SAMPLE = [
    "Sample Medical College",
    "sample-medical-college",
    "25",
    "1998",
    "Short overview of the college",
    "Private",
    "Maharashtra",
    "Mumbai",
    "Private",
    "NMC",
    "Published",
    "Sample University",
    "20 acres",
    "A",
    "Yes",
    "1",
    "yes",
    "4",
    "https://example.com/college.jpg",
    "https://example.com/gallery-1.jpg; https://example.com/gallery-2.jpg",
    "stethoscope",
    "https://example.com/podcast.mp3",
    "Sample Medical College Admission 2026",
    "Sample Medical College fees, courses, admission and facilities.",
    "medical college, mbbs, neet",
    "MBBS; BDS",
    "NEET qualified",
    "NEET UG",
    "Available",
    "Available",
    "Available",
    "12000",
    "14000",
    "16000",
    "750",
    "12",
    "25 km",
    "10 km",
    "5 km",
    "750",
    "150",
    "600",
    "Yes",
    "45",
    "Available",
    "Available",
    '[{"course":"MBBS","department":"Clinical","labs":["Anatomy Lab"]}]',
    '[{"name":"Hostel","description":"Separate hostel for students"}]',
    '[{"course":"MBBS","department":"Clinical","labs":["Anatomy Lab","Physiology Lab"]}]',
];

const escapeCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const getApiErrorMessage = (error: unknown) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (error as { response?: { data?: { message?: unknown } } })
            .response;
        const message = response?.data?.message;
        if (Array.isArray(message)) return message.join(", ");
        if (typeof message === "string") return message;
    }
    return "Failed to upload colleges";
};

type PaginationMeta = {
    pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
};

type CityFilter = {
    id: number;
    city: string;
};

type CourseCategoryFilter = {
    id: number;
    courses_category_name: string;
};

type CollegeListQueryParams = CollegeQueryParams & {
    cityId?: number;
};

export default function CollegesPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [bulkUploadResult, setBulkUploadResult] =
        useState<CollegeBulkUploadResult | null>(null);

    // Filter states
    const [cities, setCities] = useState<CityFilter[]>([]);
    const [categories, setCategories] = useState<CourseCategoryFilter[]>([]);
    const [selectedCity, setSelectedCity] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const debouncedSearch = useDebounce(searchTerm, 500);

    const fetchColleges = useCallback(async () => {
        try {
            setLoading(true);
            const params: CollegeListQueryParams = {
                page,
                pageSize: 10,
                search: debouncedSearch,
            };

            if (selectedCity !== "all") params.cityId = parseInt(selectedCity);
            if (selectedCategory !== "all") params.courseCategoryId = parseInt(selectedCategory);

            const response = await collegeService.getAll(params);
            setColleges(response.data || []);
            setMeta(response.meta || null);
        } catch (error) {
            console.error("Error fetching colleges:", error);
            setColleges([]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, selectedCity, selectedCategory]);

    const fetchFilters = async () => {
        try {
            const [citiesRes, catsRes] = await Promise.all([
                cityService.getAll({ pageSize: 100 }),
                courseCategoryService.getAll({ pageSize: 100 }),
            ]);
            setCities(citiesRes.data || []);
            setCategories(catsRes.data || []);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchColleges();
    }, [fetchColleges]);

    const handleCreate = () => {
        router.push("/colleges/create");
    };

    const handleDownloadTemplate = () => {
        const rows = [COLLEGE_IMPORT_HEADERS, COLLEGE_IMPORT_SAMPLE]
            .map((row) => row.map(escapeCsvCell).join(","))
            .join("\n");
        const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "college-bulk-upload-template.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleBulkUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        try {
            setIsUploading(true);
            setBulkUploadResult(null);
            const result = await collegeService.bulkUpload(file);
            setBulkUploadResult(result);

            if (result.failed > 0) {
                toast.warning(
                    `Import completed with ${result.failed} failed row${result.failed === 1 ? "" : "s"}`,
                );
            } else {
                toast.success(
                    `Imported ${result.created + result.updated} college${result.created + result.updated === 1 ? "" : "s"}`,
                );
            }

            setPage(1);
            fetchColleges();
        } catch (error) {
            console.error("Error uploading colleges:", error);
            toast.error(getApiErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/colleges/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this college?")) {
            try {
                await collegeService.delete(id);
                toast.success("College deleted successfully");
                fetchColleges();
            } catch (error) {
                console.error("Error deleting college:", error);
                toast.error("Failed to delete college");
            }
        }
    };

    const filters = (
        <div className="flex flex-wrap items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleBulkUpload}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-9 gap-1.5 bg-background border-border/50 text-xs font-semibold"
            >
                <Download className="h-3.5 w-3.5" />
                Template
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 gap-1.5 bg-background border-border/50 text-xs font-semibold"
            >
                <Upload className="h-3.5 w-3.5" />
                {isUploading ? "Uploading..." : "Upload Excel"}
            </Button>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[140px] h-9 bg-background border-border text-foreground">
                    <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-9 bg-background border-border text-foreground">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.courses_category_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <ListingLayout
            title="College"
            description="Manage college records, filter the directory, and import bulk updates from Excel."
            count={meta?.pagination?.total || 0}
            onCreateClick={handleCreate}
            createLabel="Add college"
            onSearchChange={(val) => {
                setSearchTerm(val);
                setPage(1);
            }}
            searchPlaceholder="Search colleges..."
            actions={filters}
        >
            {bulkUploadResult && (
                <div className="border-b border-border/50 bg-muted/40 p-4">
                    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-foreground">
                                Excel import completed
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {bulkUploadResult.totalRows} rows processed ·{" "}
                                {bulkUploadResult.created} created ·{" "}
                                {bulkUploadResult.updated} updated ·{" "}
                                {bulkUploadResult.failed} failed
                            </div>
                        </div>
                        {bulkUploadResult.errors.length > 0 && (
                            <div className="max-h-32 w-full overflow-auto rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive sm:max-w-xl">
                                {bulkUploadResult.errors.slice(0, 8).map((error) => (
                                    <div key={`${error.row}-${error.message}`}>
                                        Row {error.row}
                                        {error.college_name
                                            ? ` (${error.college_name})`
                                            : ""}
                                        : {error.message}
                                    </div>
                                ))}
                                {bulkUploadResult.errors.length > 8 && (
                                    <div className="mt-1 font-medium">
                                        +{bulkUploadResult.errors.length - 8} more errors
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">College Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">City</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Type</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Featured</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableStateRow colSpan={7} isLoading emptyLabel="" />
                    ) : colleges.length === 0 ? (
                        <TableStateRow colSpan={7} emptyLabel="No colleges found." />
                    ) : (
                        colleges.map((college) => (
                            <TableRow key={college.id} className="group hover:bg-muted/50 border-b border-border/50">
                                <TableCell className="text-muted-foreground font-medium text-[13px]">#{college.id}</TableCell>
                                <TableCell className="font-semibold text-foreground text-[13px]">{college.college_name || "Unknown"}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{college.city?.city || "N/A"}</TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{college.college_type || "N/A"}</TableCell>
                                <TableCell>
                                    {college.isFeatured ? (
                                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">Featured</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-card text-muted-foreground border-border/50 shadow-none text-[10px] font-bold uppercase py-0 px-2">Regular</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {college.publishedAt ? (
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">Published</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">Draft</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(college.id)}
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(college.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {meta?.pagination && (
                <div className="p-4 border-t border-border/50 bg-muted/50">
                    <Pagination
                        currentPage={page}
                        pageCount={meta.pagination.pageCount}
                        total={meta.pagination.total}
                        pageSize={10}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </ListingLayout>
    );
}
