"use client";

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
} from "lucide-react";

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

const collectionTypes = [
    { title: "Blog", icon: FileText, url: "/blogs" },
    { title: "City", icon: MapPin, url: "/cities" },
    { title: "College", icon: GraduationCap, url: "/colleges" },
    { title: "Contact", icon: Mail, url: "/contact-leads" },
    { title: "Counselor", icon: Users, url: "/counselors" },
    { title: "Course category", icon: Layers, url: "/categories" },
    { title: "Course category specialization", icon: Layers, url: "/course-category-specialization" },
    { title: "Sub course category", icon: Layers, url: "/sub-categories" },
    { title: "Newsletter subscribe", icon: Bell, url: "/newsletter-leads" },
    { title: "User", icon: UserCircle, url: "/users" },
];

import { Users } from "lucide-react";

const singleTypes = [
    { title: "Global Settings", icon: Settings, url: "/settings" },
    { title: "Home Page", icon: Home, url: "/home-settings" },
];

export function AppSidebar() {
    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
            <SidebarHeader className="h-auto flex flex-col gap-4 px-4 py-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        A
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-lg leading-tight">Content Manager</span>
                    </div>
                </div>

                <div className="relative group-data-[collapsible=icon]:hidden px-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="h-9 pl-9 bg-sidebar-accent/50 border-none rounded-md text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-4 mb-2 group-data-[collapsible=icon]:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Collection Types</span>
                        <span className="bg-sidebar-accent/50 text-[10px] px-1.5 py-0.5 rounded text-muted-foreground font-medium">{collectionTypes.length}</span>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {collectionTypes.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        render={<a href={item.url} />}
                                        tooltip={item.title}
                                        className="hover:bg-sidebar-accent/50 active:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4">
                    <div className="flex items-center justify-between px-4 mb-2 group-data-[collapsible=icon]:hidden">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Single Types</span>
                        <span className="bg-sidebar-accent/50 text-[10px] px-1.5 py-0.5 rounded text-muted-foreground font-medium">{singleTypes.length}</span>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {singleTypes.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        render={<a href={item.url} />}
                                        tooltip={item.title}
                                        className="hover:bg-sidebar-accent/50 active:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="w-full hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent"
                            />
                        }
                    >
                        <Avatar className="h-8 w-8 rounded">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">AD</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                            <span className="truncate font-semibold text-sidebar-foreground">Super Admin</span>
                            <span className="truncate text-[10px] text-muted-foreground">Admin panel</span>
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
                        side="top"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
