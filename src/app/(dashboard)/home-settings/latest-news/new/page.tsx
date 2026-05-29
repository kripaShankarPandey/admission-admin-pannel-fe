"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { latestNewsService } from "@/services/latest-news-service";
import { LatestNewsEditor, type LatestNewsEditorPayload } from "@/components/latest-news/latest-news-editor";

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "Failed to create news item. Please try again.";
};

export default function NewLatestNewsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (payload: LatestNewsEditorPayload) => {
    try {
      setIsSaving(true);
      await latestNewsService.create(payload);
      toast.success("News item created successfully.");
      router.push("/home-settings/latest-news");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LatestNewsEditor
      mode="create"
      isSaving={isSaving}
      onCancel={() => router.push("/home-settings/latest-news")}
      onSubmit={handleSubmit}
    />
  );
}
