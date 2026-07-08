import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ErrorBoundary } from "@/components/error-boundary";
import { RouteGuard } from "@/components/route-guard";
import { ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/site";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Admission Today / Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href={siteUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            Visit Website
                        </a>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
                    <ErrorBoundary>
                        <RouteGuard>
                            {children}
                        </RouteGuard>
                    </ErrorBoundary>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
