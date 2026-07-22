import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
} from "@/components/ui/breadcrumb";
import { ErrorBoundary } from "@/components/error-boundary";
import { RouteGuard } from "@/components/route-guard";
import { ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { CommandPalette } from "@/components/command-palette";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            {/* Global ⌘K search, available on every dashboard page. */}
            <CommandPalette />
            <AppSidebar />
            <SidebarInset className="bg-background">
                <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Admission Today / Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden text-[10px] text-muted-foreground sm:inline">
                            Press{" "}
                            <kbd className="rounded border border-border px-1 font-sans">⌘K</kbd>{" "}
                            to search
                        </span>
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
                <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 sm:p-6">
                    <ErrorBoundary>
                        <RouteGuard>
                            {/* Keyed on nothing in particular — the animation
                                replays per route because the subtree remounts,
                                giving navigation a beat instead of a snap. */}
                            <div className="animate-page-in">{children}</div>
                        </RouteGuard>
                    </ErrorBoundary>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
