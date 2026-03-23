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
    ArrowUpRight,
    TrendingUp,
} from "lucide-react";

const stats = [
    {
        title: "Total Colleges",
        value: "1,280",
        description: "+12 from last month",
        icon: GraduationCap,
        color: "text-blue-600",
    },
    {
        title: "Active Blogs",
        value: "450",
        description: "+3 this week",
        icon: BookText,
        color: "text-green-600",
    },
    {
        title: "Total Leads",
        value: "2,400",
        description: "+180 since Jan",
        icon: Mail,
        color: "text-orange-600",
    },
    {
        title: "Registered Users",
        value: "12,000",
        description: "+5% increase",
        icon: Users,
        color: "text-purple-600",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
                <p className="text-[#a5a5ba] text-lg">
                    Welcome back, Admin. Here's what's happening today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-muted/10 border-white/10 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#a5a5ba]">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-[#a5a5ba]">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-muted/10 border-white/10 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-[#a5a5ba]">
                            New leads and content updates across the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-9 w-9 bg-white/5 rounded-full flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-[#a5a5ba]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">New lead from John Doe</p>
                                        <p className="text-xs text-[#a5a5ba]">Contacted via "Contact Us" form</p>
                                    </div>
                                    <div className="text-xs text-[#a5a5ba]">2m ago</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-muted/10 border-white/10 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-white">Platform Stats</CardTitle>
                        <CardDescription className="text-[#a5a5ba]">
                            Quick health check of your data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-white">Form Completion Rate</span>
                                    <span className="text-[#a5a5ba]">64%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[64%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-white">SEO Score (Average)</span>
                                    <span className="text-[#a5a5ba]">82%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-600 w-[82%]" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
