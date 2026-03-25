import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GraduationCap,
    BookText,
    Users,
    Mail,
    TrendingUp,
    MoreHorizontal,
    Activity,
    ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const stats = [
    {
        title: "Total Colleges",
        value: "1,280",
        description: "+12.5% vs last month",
        icon: GraduationCap,
        color: "bg-blue-500",
        lightColor: "bg-blue-500/10 text-blue-600",
    },
    {
        title: "Active Blogs",
        value: "450",
        description: "+3.2% vs last week",
        icon: BookText,
        color: "bg-emerald-500",
        lightColor: "bg-emerald-500/10 text-emerald-600",
    },
    {
        title: "Total Leads",
        value: "2,400",
        description: "+18% since January",
        icon: Mail,
        color: "bg-amber-500",
        lightColor: "bg-amber-500/10 text-amber-600",
    },
    {
        title: "Registered Users",
        value: "12,000",
        description: "+5.0% vs last month",
        icon: Users,
        color: "bg-indigo-500",
        lightColor: "bg-indigo-500/10 text-indigo-600",
    },
];

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
                    <p className="text-sm text-muted-foreground mt-1.5">
                        Welcome back, Admin. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="shadow-xs font-semibold px-6">Download Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-border/60 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/50 backdrop-blur-sm">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${stat.lightColor} group-hover:scale-110 duration-200`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-[28px] font-bold text-foreground tracking-tight leading-none">{stat.value}</div>
                            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-500">{stat.description.split(' ')[0]}</span>
                                <span>{stat.description.substring(stat.description.indexOf(' ') + 1)}</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/60 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                            <CardDescription className="text-sm">
                                Latest interactions and updates across the platform.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {[
                                { name: "John Doe", action: "Contacted via form", time: "2m ago", avatar: "JD" },
                                { name: "Alice Smith", action: "Registered a new account", time: "1h ago", avatar: "AS" },
                                { name: "Mark Johnson", action: "Published a new blog post", time: "3h ago", avatar: "MJ" },
                                { name: "Emma Davis", action: "Updated college profile", time: "5h ago", avatar: "ED" },
                                { name: "Michael Wilson", action: "Subscribed to newsletter", time: "1d ago", avatar: "MW" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <Avatar className="h-10 w-10 border border-border/50 shadow-xs">
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{item.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.action}</p>
                                    </div>
                                    <div className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-border/60 shadow-xs flex flex-col">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="text-base font-semibold">Platform Health</CardTitle>
                        <CardDescription className="text-sm">
                            Real-time systems and configuration checks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-semibold">Form Completion Rate</span>
                                    </div>
                                    <span className="text-sm font-bold">88%</span>
                                </div>
                                <div className="h-2.5 w-full bg-muted overflow-hidden rounded-full shadow-inner">
                                    <div className="h-full bg-blue-500 w-[88%] rounded-full relative">
                                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookText className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-semibold">Average SEO Score</span>
                                    </div>
                                    <span className="text-sm font-bold">92%</span>
                                </div>
                                <div className="h-2.5 w-full bg-muted overflow-hidden rounded-full shadow-inner">
                                    <div className="h-full bg-emerald-500 w-[92%] rounded-full relative">
                                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                        <span className="text-sm font-semibold">Server Uptime</span>
                                    </div>
                                    <span className="text-sm font-bold">99.9%</span>
                                </div>
                                <div className="h-2.5 w-full bg-muted overflow-hidden rounded-full shadow-inner">
                                    <div className="h-full bg-indigo-500 w-[99.9%] rounded-full relative">
                                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                                <h4 className="font-bold text-foreground mb-1 relative z-10">System Status</h4>
                                <p className="text-sm text-muted-foreground mb-4 relative z-10 leading-relaxed">All core systems, API endpoints, and database clusters are operating nominally.</p>
                                <Button variant="outline" className="w-full text-foreground bg-background hover:bg-accent border-border/50 shadow-sm relative z-10 font-semibold">
                                    View Detailed Logs
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
