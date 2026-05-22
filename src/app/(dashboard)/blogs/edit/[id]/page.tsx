"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BlogEditor,
  type BlogEditorPayload,
} from "@/components/blog/blog-editor";
import { blogService, type Blog } from "@/services/blog-service";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const response = await blogService.getOne(Number(params.id));
        setBlog(response);
      } catch (error) {
        console.error("Failed to load blog:", error);
        toast.error("Failed to load blog.");
        router.push("/blogs");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBlog();
  }, [params.id, router]);

  const handleSubmit = async (payload: BlogEditorPayload) => {
    try {
      setIsSaving(true);
      await blogService.update(Number(params.id), payload);
      toast.success("Blog updated successfully.");
      router.push("/blogs");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to update blog.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-muted-foreground">
        Loading blog editor...
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <BlogEditor
      mode="edit"
      initialData={blog}
      isSaving={isSaving}
      onCancel={() => router.push("/blogs")}
      onSubmit={handleSubmit}
    />
  );
}
