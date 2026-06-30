import Cookies from "js-cookie";

// Uploads an image to the backend (S3) and returns its public URL.
// Goes through the same /api/proxy path as the rest of the admin API so the
// auth cookie + backend URL handling stay consistent. Uses fetch (not the axios
// instance) so the browser sets the multipart boundary automatically.
export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const token = Cookies.get("admin_token");
  const res = await fetch(
    `/api/proxy/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Image upload failed");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
