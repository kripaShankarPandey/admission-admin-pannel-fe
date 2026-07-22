"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

function getPathPermission(pathname: string): string | null {
  if (pathname === '/' || pathname === '/login') return null;
  if (pathname.startsWith('/blogs') || pathname.startsWith('/blog-categories')) return 'blogs';
  if (pathname.startsWith('/colleges')) return 'colleges';
  if (pathname.startsWith('/cutoffs')) return 'cutoffs';
  if (pathname.startsWith('/cities')) return 'cities';
  if (pathname.startsWith('/discipline') || pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/contact-leads')) return 'contact-leads';
  if (pathname.startsWith('/counselor-leads')) return 'counselor-leads';
  if (pathname.startsWith('/reviews')) return 'reviews';
  if (pathname.startsWith('/counselors')) return 'counselors';
  if (pathname.startsWith('/newsletter-leads')) return 'newsletter-leads';
  if (pathname.startsWith('/reach-us')) return 'reach-us';
  if (pathname.startsWith('/home-settings/banner')) return 'home-page';
  if (pathname.startsWith('/home-settings/latest-news')) return 'latest-news';
  if (pathname.startsWith('/exam-dates')) return 'exam-dates';
  if (pathname.startsWith('/scholarships')) return 'scholarships';
  if (pathname.startsWith('/faqs')) return 'faqs';
  if (pathname.startsWith('/home-settings/seo-content')) return 'home-page';
  if (pathname.startsWith('/settings/admin-users')) return 'users_management'; // strictly super_admin
  if (pathname.startsWith('/settings/auth-providers')) return 'auth-providers';
  if (pathname.startsWith('/settings/activity')) return 'activity-log';
  if (pathname.startsWith('/media')) return 'media';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/users')) return 'website-users'; // website users list
  return null;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Tracks *which* path was approved, not just a boolean: a plain flag stays
  // true after navigating to a page the editor may not open, so the forbidden
  // page renders until the redirect lands.
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);
  const authorized = authorizedPath === pathname;
  const [, startTransition] = useTransition();

  // localStorage is unavailable while server-rendering, so this check cannot
  // move into render without causing a hydration mismatch — hence the
  // set-state-in-effect exemptions on the two approvals below.
  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user");
    if (!storedUser) {
      startTransition(() => {
        router.push("/login");
      });
      return;
    }

    try {
      const user = JSON.parse(storedUser) as {
        role?: string;
        permissions?: string[];
      };
      if (user.role === "super_admin") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthorizedPath(pathname);
        return;
      }

      if (user.role === "editor") {
        const requiredPermission = getPathPermission(pathname);
        if (requiredPermission === 'users_management') {
          startTransition(() => {
            router.push("/");
          });
          return;
        }

        if (requiredPermission) {
          const userPermissions = user.permissions || [];
          if (!userPermissions.includes(requiredPermission)) {
            startTransition(() => {
              router.push("/");
            });
            return;
          }
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthorizedPath(pathname);
        return;
      }

      // regular user has no access to admin panel
      localStorage.removeItem("admin_user");
      startTransition(() => {
        router.push("/login");
      });
    } catch {
      startTransition(() => {
        router.push("/login");
      });
    }
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Verifying access permissions...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
