// Public frontend (website) base URL — used to build "View on site" links.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://beta.mcccounselling.in";

/** Build an absolute URL to a page on the public website. */
export function siteUrl(path = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
