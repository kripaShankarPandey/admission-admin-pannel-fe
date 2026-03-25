"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    GraduationCap,
    MapPin,
    Settings,
    Mail,
    Home,
    Search,
    ChevronRight,
    LogOut,
    FileText,
    Layers,
    UserCircle,
    Bell,
    Users,
    LayoutDashboard
} from "lucide-react";

import { authService } from "@/services/auth-service";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const mainNav = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/" },
];

const collectionTypes = [
    { title: "Blog", icon: FileText, url: "/blogs" },
    { title: "City", icon: MapPin, url: "/cities" },
    { title: "College", icon: GraduationCap, url: "/colleges" },
    { title: "Contact", icon: Mail, url: "/contact-leads" },
    { title: "Counselor", icon: Users, url: "/counselors" },
    { title: "Discipline", icon: Layers, url: "/categories" },
    { title: "Courses", icon: Layers, url: "/sub-categories" },
    { title: "Specialization", icon: Layers, url: "/course-category-specialization" },
    { title: "Newsletter subscribe", icon: Bell, url: "/newsletter-leads" },
    { title: "User", icon: UserCircle, url: "/users" },
];

const singleTypes = [
    { title: "Global Settings", icon: Settings, url: "/settings" },
    { title: "Home Page", icon: Home, url: "/home-settings" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name?: string; username?: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("admin_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse admin_user", e);
            }
        }
    }, []);

    const displayName = user?.name || user?.username || "Super Admin";
    const displayEmail = user?.email || "Admin panel";
    const initial = displayName.charAt(0).toUpperCase();

    // Helper to determine if menu item is active
    const checkActive = (url: string) => {
        if (url === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(url);
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
            <SidebarHeader className="h-auto flex flex-col gap-5 px-4 py-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl shrink-0 shadow-sm border border-primary/20">
                        A
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-lg leading-tight text-sidebar-foreground tracking-tight">Admission Today</span>
                        <span className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest mt-0.5">Admin Panel</span>
                    </div>
                </div>

                <div className="relative group-data-[collapsible=icon]:hidden px-2 mt-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
                    <Input
                        placeholder="Search..."
                        className="h-10 pl-9 bg-sidebar-accent/30 border-sidebar-border/50 rounded-lg text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-sidebar-accent hover:border-sidebar-border transition-colors"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 scrollbar-none">
                {/* Main Menu */}
                <SidebarGroup>
                    <div className="flex items-center justify-between px-4 mb-2 group-data-[collapsible=icon]:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Main Menu</span>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item) => {
                                const isActive = checkActive(item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            render={<a href={item.url} />}
                                            tooltip={item.title}
                                            data-active={isActive ? "true" : "false"}
                                            className={`py-5 px-3 mb-1 rounded-lg transition-all duration-200 ${
                                                isActive 
                                                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15" 
                                                : "text-sidebar-foreground/70 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }`}
                                        >
                                            <item.icon className="h-[18px] w-[18px]" />
                                            <span className="text-[13px]">{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Collection Types */}
                <SidebarGroup className="mt-2">
                    <div className="flex items-center justify-between px-4 mb-2 group-data-[collapsible=icon]:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Collection Types</span>
                        <span className="bg-sidebar-accent border border-sidebar-border/50 text-[10px] px-1.5 py-0.5 rounded-md text-sidebar-foreground/70 font-bold">{collectionTypes.length}</span>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {collectionTypes.map((item) => {
                                const isActive = checkActive(item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            render={<a href={item.url} />}
                                            tooltip={item.title}
                                            data-active={isActive ? "true" : "false"}
                                            className={`py-5 px-3 mb-1 rounded-lg transition-all duration-200 ${
                                                isActive 
                                                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15" 
                                                : "text-sidebar-foreground/70 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }`}
                                        >
                                            <item.icon className="h-[18px] w-[18px]" />
                                            <span className="text-[13px]">{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Single Types */}
                <SidebarGroup className="mt-2 mb-6">
                    <div className="flex items-center justify-between px-4 mb-2 group-data-[collapsible=icon]:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">Single Types</span>
                        <span className="bg-sidebar-accent border border-sidebar-border/50 text-[10px] px-1.5 py-0.5 rounded-md text-sidebar-foreground/70 font-bold">{singleTypes.length}</span>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {singleTypes.map((item) => {
                                const isActive = checkActive(item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            render={<a href={item.url} />}
                                            tooltip={item.title}
                                            data-active={isActive ? "true" : "false"}
                                            className={`py-5 px-3 mb-1 rounded-lg transition-all duration-200 ${
                                                isActive 
                                                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15" 
                                                : "text-sidebar-foreground/70 font-medium hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }`}
                                        >
                                            <item.icon className="h-[18px] w-[18px]" />
                                            <span className="text-[13px]">{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border/30">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-sidebar-border/50 hover:bg-sidebar-accent/50 transition-all data-[state=open]:bg-sidebar-accent"
                            />
                        }
                    >
                        <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border/50">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initial}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden flex-1">
                                <span className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</span>
                                <span className="truncate text-[10px] font-medium text-sidebar-foreground/50">{displayEmail}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden ml-auto" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border-sidebar-border/50 p-2"
                        side="top"
                        align="end"
                        sideOffset={8}
                    >
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg p-2.5 font-medium" onClick={() => authService.logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
