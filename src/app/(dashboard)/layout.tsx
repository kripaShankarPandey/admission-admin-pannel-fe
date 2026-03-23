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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 border-b border-white/5 bg-background">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#a5a5ba]">Admission Today / Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Add any global actions here like notifications or help */}
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
