"use client";

import { type ComponentType, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Bus,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  Headset,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Newspaper,
  Plane,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  TrainFront,
  UserCircle,
  Users,
} from "lucide-react";

import { authService } from "@/services/auth-service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  url: string;
  permission?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [{ title: "Dashboard", icon: LayoutDashboard, url: "/" }],
  },
  {
    title: "Home",
    items: [
      { title: "Banner", icon: Layers, url: "/home-settings/banner", permission: "home-page" },
      { title: "Latest News", icon: Newspaper, url: "/home-settings/latest-news", permission: "latest-news" },
      { title: "SEO Content", icon: FileText, url: "/home-settings/seo-content", permission: "home-page" },
      { title: "Exam Dates", icon: CalendarDays, url: "/exam-dates", permission: "exam-dates" },
      { title: "Scholarships", icon: Award, url: "/scholarships", permission: "scholarships" },
      { title: "FAQs", icon: HelpCircle, url: "/faqs", permission: "faqs" },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Blog", icon: FileText, url: "/blogs", permission: "blogs" },
      { title: "Blog Categories", icon: Tag, url: "/blog-categories", permission: "blogs" },
      { title: "College", icon: GraduationCap, url: "/colleges", permission: "colleges" },
      { title: "City", icon: MapPin, url: "/cities", permission: "cities" },
      { title: "Discipline", icon: Layers, url: "/discipline", permission: "courses" },
      { title: "Courses", icon: Layers, url: "/courses", permission: "courses" },
    ],
  },
  {
    title: "Leads & People",
    items: [
      { title: "Contact Leads", icon: Mail, url: "/contact-leads", permission: "contact-leads" },
      { title: "Counselor Leads", icon: Headset, url: "/counselor-leads", permission: "counselor-leads" },
      { title: "Reviews", icon: Star, url: "/reviews", permission: "reviews" },
      { title: "Counselors", icon: Users, url: "/counselors", permission: "counselors" },
      { title: "Newsletter", icon: Bell, url: "/newsletter-leads", permission: "newsletter-leads" },
      { title: "Website Users", icon: UserCircle, url: "/users", permission: "website-users" },
    ],
  },
  {
    title: "Reach Us",
    items: [
      { title: "Airport", icon: Plane, url: "/reach-us/airport", permission: "reach-us" },
      { title: "Bus Station", icon: Bus, url: "/reach-us/bus-station", permission: "reach-us" },
      {
        title: "Railway Station",
        icon: TrainFront,
        url: "/reach-us/railway-station",
        permission: "reach-us",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Global Settings", icon: Settings, url: "/settings", permission: "settings" },
      { title: "Admin Users", icon: ShieldCheck, url: "/settings/admin-users" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const storedUser = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem("admin_user"),
    () => null,
  );

  const user = useMemo(() => {
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as {
        name?: string;
        username?: string;
        email: string;
        role: string;
        permissions?: string[];
      };
    } catch (error) {
      console.error("Failed to parse admin_user", error);
      return null;
    }
  }, [storedUser]);

  const filteredNavSections = useMemo(() => {
    if (!user) return [];
    if (user.role === "super_admin") {
      return navSections;
    }

    const userPermissions = user.permissions || [];

    return navSections
      .map((section) => {
        const items = section.items.filter((item) => {
          // Dashboard is always visible to logged-in users
          if (item.url === "/") return true;

          // If item requires specific section permission, check if user has it
          if (item.permission) {
            return userPermissions.includes(item.permission);
          }

          // If item doesn't have a permission key (like "Users"), it is super-admin only
          return false;
        });
        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [user]);

  const displayName = user?.name || user?.username || "Super Admin";
  const displayEmail = user?.email || "Admin panel";
  const initial = displayName.charAt(0).toUpperCase();

  const allNavUrls = useMemo(() => {
    return filteredNavSections.flatMap((s) => s.items.map((i) => i.url));
  }, [filteredNavSections]);

  const checkActive = (url: string) => {
    if (url === "/") return pathname === "/";
    const match = pathname === url || pathname.startsWith(url + "/");
    if (!match) return false;
    return !allNavUrls.some(
      (other) =>
        other !== url &&
        other.length > url.length &&
        (pathname === other || pathname.startsWith(other + "/")),
    );
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border/50 bg-sidebar"
    >
      <SidebarHeader className="px-3 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/45 bg-sidebar-accent/25 px-3 py-3 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
            A
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
              Admission Today
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Admin Panel
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-3 scrollbar-none">
        {filteredNavSections.map((section) => (
          <SidebarGroup key={section.title} className="py-2">
            <div className="mb-1.5 flex items-center justify-between px-3 group-data-[collapsible=icon]:hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/45">
                {section.title}
              </span>
              <span className="rounded-md border border-sidebar-border/50 bg-sidebar-accent/40 px-1.5 py-0.5 text-[10px] font-bold text-sidebar-foreground/60">
                {section.items.length}
              </span>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = checkActive(item.url);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<a href={item.url} />}
                        tooltip={item.title}
                        data-active={isActive ? "true" : "false"}
                        className={cn(
                          "relative h-10 rounded-lg px-3 text-[13px] font-medium transition-all duration-200",
                          "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                          "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:px-0",
                          isActive &&
                            "bg-primary/10 text-primary shadow-xs hover:bg-primary/15 hover:text-primary",
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary group-data-[collapsible=icon]:hidden" />
                        )}
                        <Icon
                          className={cn(
                            "h-[17px] w-[17px]",
                            isActive
                              ? "text-primary"
                              : "text-sidebar-foreground/50",
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-auto w-full rounded-xl border border-sidebar-border/45 bg-sidebar-accent/25 p-2.5 transition-all hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent"
              />
            }
          >
            <div className="flex w-full items-center gap-3">
              <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border/50">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">
                  {displayName}
                </div>
                <div className="truncate text-[10px] font-medium text-sidebar-foreground/50">
                  {displayEmail}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-sidebar-border/50 p-2 shadow-lg"
            side="top"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuItem
              className="cursor-pointer rounded-lg p-2.5 font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => authService.logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
