"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { collegeService } from "@/services/college-service";
import { cityService } from "@/services/city-service";
import { courseCategoryService } from "@/services/course-category-service";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function CollegesPage() {
    const router = useRouter();
    const [colleges, setColleges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    // Filter states
    const [cities, setCities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const debouncedSearch = useDebounce(searchTerm, 500);

    const fetchColleges = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
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
        <div className="flex gap-2">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[140px] h-9 bg-muted/20 border-white/10 text-white">
                    <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-[#212134] border-white/10 text-white">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-9 bg-muted/20 border-white/10 text-white">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#212134] border-white/10 text-white">
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
            count={meta?.pagination?.total || 0}
            onCreateClick={handleCreate}
            onSearchChange={(val) => {
                setSearchTerm(val);
                setPage(1);
            }}
            actions={filters}
        >
            <Table>
                <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-b border-white/5">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">College Name</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">City</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Type</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Featured</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Status</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-10">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-[#a5a5ba]">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : colleges.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-[#a5a5ba] font-medium">
                                No colleges found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        colleges.map((college) => (
                            <TableRow key={college.id} className="group hover:bg-white/5 border-b border-white/5">
                                <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{college.id}</TableCell>
                                <TableCell className="font-semibold text-white text-[13px]">{college.college_name || "Unknown"}</TableCell>
                                <TableCell className="text-[#a5a5ba] text-[13px]">{college.city?.city || "N/A"}</TableCell>
                                <TableCell className="text-[#a5a5ba] text-[13px]">{college.college_type || "N/A"}</TableCell>
                                <TableCell>
                                    {college.isFeatured ? (
                                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">Featured</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-muted/10 text-[#a5a5ba] border-white/5 shadow-none text-[10px] font-bold uppercase py-0 px-2">Regular</Badge>
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
                                            <Edit className="h-4 w-4 text-[#a5a5ba]" />
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
                <div className="p-4 border-t border-white/5 bg-white/5">
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
