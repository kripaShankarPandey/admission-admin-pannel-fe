"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { blogService } from "@/services/blog-service";
import {
  BlogEditor,
  type BlogEditorPayload,
} from "@/components/blog/blog-editor";

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "Failed to create blog. Please try again.";
};

export default function NewBlogPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (payload: BlogEditorPayload) => {
    try {
      setIsSaving(true);
      await blogService.create(payload);
      toast.success("Blog post created successfully.");
      router.push("/blogs");
    } catch (error) {
      console.error("Failed to create blog:", error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BlogEditor
      mode="create"
      isSaving={isSaving}
      onCancel={() => router.push("/blogs")}
      onSubmit={handleSubmit}
    />
  );
}
