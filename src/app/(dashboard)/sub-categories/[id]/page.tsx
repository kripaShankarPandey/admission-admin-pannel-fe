import { SubCategoryForm } from "@/components/content-manager/sub-category-form";

export default function EditCoursePage({ params }: { params: { id: string } }) {
    return (
        <div className="p-6">
            <SubCategoryForm courseId={parseInt(params.id)} />
        </div>
    );
}
