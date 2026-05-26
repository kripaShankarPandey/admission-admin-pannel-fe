import { SubCategoryForm } from "@/components/content-manager/sub-category-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="p-6">
            <SubCategoryForm courseId={id} />
        </div>
    );
}
