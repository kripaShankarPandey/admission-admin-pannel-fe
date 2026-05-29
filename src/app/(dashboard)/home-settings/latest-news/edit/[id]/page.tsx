"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { latestNewsService, type LatestNews } from "@/services/latest-news-service";
import { LatestNewsEditor, type LatestNewsEditorPayload } from "@/components/latest-news/latest-news-editor";

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "Failed to update news item. Please try again.";
};

export default function EditLatestNewsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<LatestNews | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;
    latestNewsService.getOne(id)
      .then(setNewsItem)
      .catch(() => {
        toast.error("News item not found.");
        router.push("/home-settings/latest-news");
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  const handleSubmit = async (payload: LatestNewsEditorPayload) => {
    try {
      setIsSaving(true);
      await latestNewsService.update(Number(params.id), payload);
      toast.success("News item updated successfully.");
      router.push("/home-settings/latest-news");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <LatestNewsEditor
      mode="edit"
      initialData={newsItem}
      isSaving={isSaving}
      onCancel={() => router.push("/home-settings/latest-news")}
      onSubmit={handleSubmit}
    />
  );
}
