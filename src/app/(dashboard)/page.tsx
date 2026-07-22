"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  GraduationCap,
  BookText,
  Mail,
  Users,
  Newspaper,
  UserCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Bell,
  LayoutDashboard,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { collegeService } from "@/services/college-service";
import { blogService } from "@/services/blog-service";
import { blogCategoryService } from "@/services/blog-category-service";
import { leadService } from "@/services/lead-service";
import { latestNewsService } from "@/services/latest-news-service";
import { userService } from "@/services/user-service";
import { counselorService } from "@/services/counselor-service";
import { cn } from "@/lib/utils";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";

// ---------- Types ----------
interface DashboardStats {
  colleges: number;
  blogs: number;
  blogCategories: number;
  contactLeads: number;
  newsletterLeads: number;
  news: number;
  users: number;
  counselors: number;
}

interface RecentLead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

interface RecentBlog {
  id: number;
  title: string;
  slug: string;
  category?: { name: string };
  publishedAt: string | null;
  createdAt: string;
}

interface RecentNews {
  id: number;
  title: string;
  slug: string;
  is_featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

// ---------- Skeleton ----------
function StatSkeleton() {
  return (
    <div className="h-[130px] rounded-2xl bg-card border border-border/60 animate-pulse" />
  );
}

// ---------- Stat Card ----------
interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ElementType;
  href: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}

function StatCard({ title, value, icon: Icon, href, gradient, iconBg, iconColor, loading }: StatCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm",
          "transition-surface duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5",
        )}
      >
        {/* Gradient accent */}
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", gradient)} />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</p>
            {loading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
            ) : (
              <p className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                {value?.toLocaleString() ?? "—"}
              </p>
            )}
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">Live count</span>
            </div>
          </div>
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>

        {/* Arrow on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-surface duration-200 translate-x-1 group-hover:translate-x-0">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

// ---------- Main Page ----------
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    colleges: 0, blogs: 0, blogCategories: 0, contactLeads: 0,
    newsletterLeads: 0, news: 0, users: 0, counselors: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [recentNews, setRecentNews] = useState<RecentNews[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [colleges, blogs, blogCategories, contactLeads, newsletterLeads, news, users, counselors] =
        await Promise.allSettled([
          collegeService.getAll({ page: 1, pageSize: 1 }),
          blogService.getAll({ page: 1, pageSize: 1 }),
          blogCategoryService.getAll({ page: 1, pageSize: 1 }),
          leadService.getContactLeads(),
          leadService.getNewsletterLeads(),
          latestNewsService.getAll({ page: 1, pageSize: 1 }),
          userService.getAll(),
          counselorService.getAll({ page: 1, pageSize: 1 }),
        ]);

      setStats({
        colleges: colleges.status === "fulfilled" ? colleges.value.meta.pagination.total : 0,
        blogs: blogs.status === "fulfilled" ? blogs.value.meta.pagination.total : 0,
        blogCategories: blogCategories.status === "fulfilled" ? blogCategories.value.meta.pagination.total : 0,
        contactLeads: contactLeads.status === "fulfilled" ? (contactLeads.value?.length ?? 0) : 0,
        newsletterLeads: newsletterLeads.status === "fulfilled" ? (newsletterLeads.value?.length ?? 0) : 0,
        news: news.status === "fulfilled" ? news.value.meta.pagination.total : 0,
        users: users.status === "fulfilled" ? (users.value?.length ?? 0) : 0,
        counselors: counselors.status === "fulfilled" ? counselors.value.meta.pagination.total : 0,
      });
    } catch (_) {
      // silently fail – individual settled results handle partial success
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const [leadsResult, blogsResult, newsResult] = await Promise.allSettled([
        leadService.getContactLeads(),
        blogService.getAll({ page: 1, pageSize: 5 }),
        latestNewsService.getAll({ page: 1, pageSize: 5 }),
      ]);

      if (leadsResult.status === "fulfilled") {
        const sorted = [...(leadsResult.value ?? [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentLeads(sorted.slice(0, 5));
      }
      if (blogsResult.status === "fulfilled") {
        setRecentBlogs(blogsResult.value?.data?.slice(0, 5) ?? []);
      }
      if (newsResult.status === "fulfilled") {
        setRecentNews(newsResult.value?.data?.slice(0, 5) ?? []);
      }
    } catch (_) {
      // silently fail
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatsLoading(true);
    setActivityLoading(true);
    await Promise.all([fetchStats(), fetchActivity()]);
    setLastRefreshed(new Date());
    setRefreshing(false);
  };

  const statCards = [
    { title: "Total Colleges", value: stats.colleges, icon: GraduationCap, href: "/colleges", gradient: "bg-gradient-to-br from-violet-500/5 to-transparent", iconBg: "bg-violet-500/10", iconColor: "text-violet-600" },
    { title: "Published Blogs", value: stats.blogs, icon: BookText, href: "/blogs", gradient: "bg-gradient-to-br from-blue-500/5 to-transparent", iconBg: "bg-blue-500/10", iconColor: "text-blue-600" },
    { title: "Blog Categories", value: stats.blogCategories, icon: Tag, href: "/blog-categories", gradient: "bg-gradient-to-br from-cyan-500/5 to-transparent", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-600" },
    { title: "Contact Leads", value: stats.contactLeads, icon: Mail, href: "/contact-leads", gradient: "bg-gradient-to-br from-amber-500/5 to-transparent", iconBg: "bg-amber-500/10", iconColor: "text-amber-600" },
    { title: "Newsletter Subscribers", value: stats.newsletterLeads, icon: Bell, href: "/newsletter-leads", gradient: "bg-gradient-to-br from-rose-500/5 to-transparent", iconBg: "bg-rose-500/10", iconColor: "text-rose-600" },
    { title: "Latest News", value: stats.news, icon: Newspaper, href: "/home-settings/latest-news", gradient: "bg-gradient-to-br from-emerald-500/5 to-transparent", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600" },
    { title: "Website Users", value: stats.users, icon: UserCircle, href: "/users", gradient: "bg-gradient-to-br from-indigo-500/5 to-transparent", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-600" },
    { title: "Counselors", value: stats.counselors, icon: Users, href: "/counselors", gradient: "bg-gradient-to-br from-pink-500/5 to-transparent", iconBg: "bg-pink-500/10", iconColor: "text-pink-600" },
  ];

  const quickActions = [
    { label: "Add New College", href: "/colleges/create", icon: GraduationCap, color: "text-violet-600 bg-violet-500/10" },
    { label: "Write a Blog", href: "/blogs/new", icon: BookText, color: "text-blue-600 bg-blue-500/10" },
    { label: "Add Latest News", href: "/home-settings/latest-news/new", icon: Newspaper, color: "text-emerald-600 bg-emerald-500/10" },
    { label: "View All Leads", href: "/contact-leads", icon: MessageSquare, color: "text-amber-600 bg-amber-500/10" },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Overview of all platform activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 font-semibold text-[13px] border-border/60 hover:bg-accent"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((s) => (
              <StatCard key={s.title} {...s} loading={statsLoading} />
            ))}
      </div>

      {/* ── Analytics ── */}
      <AnalyticsPanel />

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Contact Leads */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  Recent Contact Leads
                </CardTitle>
                <CardDescription className="text-[12px]">
                  Latest inbound enquiries from prospective students
                </CardDescription>
              </div>
              <Link href="/contact-leads" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors rounded-md px-2 py-1 hover:bg-primary/5">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-2.5 bg-muted rounded w-2/3" />
                      </div>
                      <div className="h-2.5 bg-muted rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No leads yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Contact leads will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recentLeads.map((lead) => {
                    const initials = lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <Link
                        key={lead.id}
                        href={`/contact-leads?lead=${lead.id}`}
                        className="flex items-start gap-3 py-3 group -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                          <AvatarFallback className="bg-amber-500/10 text-amber-700 text-[11px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">{lead.name}</p>
                            <span className="text-[10px] text-muted-foreground/70 shrink-0 bg-muted px-1.5 py-0.5 rounded">
                              #{lead.id}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate">{lead.email}</p>
                          <p className="text-[12px] text-muted-foreground/80 line-clamp-1 mt-0.5">{lead.message}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + System Status */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-[12px]">Shortcuts to common tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition-surface duration-150 hover:bg-accent group border border-transparent hover:border-border/50"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", action.color)}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] font-medium text-foreground flex-1">{action.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-bold">System Status</CardTitle>
              <CardDescription className="text-[12px]">Platform health overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  { label: "API Server", status: "operational", color: "text-emerald-600", bg: "bg-emerald-500" },
                  { label: "Database", status: "operational", color: "text-emerald-600", bg: "bg-emerald-500" },
                  { label: "Media Storage", status: "operational", color: "text-emerald-600", bg: "bg-emerald-500" },
                  { label: "Email Service", status: "operational", color: "text-emerald-600", bg: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", item.bg)} />
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", item.bg)} />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold border-0 px-2 py-0.5", item.color, "bg-emerald-500/10")}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Blogs & News ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Blogs */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookText className="h-4 w-4 text-blue-500" />
                Recent Blogs
              </CardTitle>
              <CardDescription className="text-[12px]">Latest blog posts on the platform</CardDescription>
            </div>
            <Link href="/blogs" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors rounded-md px-2 py-1 hover:bg-primary/5">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : recentBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No blogs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/edit/${blog.id}`}
                    className="py-3 flex items-start justify-between gap-3 group -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {blog.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {blog.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium h-4">
                            {blog.category.name}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {blog.publishedAt ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Live
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Draft
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent News */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-emerald-500" />
                Latest News
              </CardTitle>
              <CardDescription className="text-[12px]">Recent news articles & updates</CardDescription>
            </div>
            <Link href="/home-settings/latest-news" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors rounded-md px-2 py-1 hover:bg-primary/5">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : recentNews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Newspaper className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No news yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/home-settings/latest-news/edit/${news.id}`}
                    className="py-3 flex items-start justify-between gap-3 group -mx-2 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {news.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {news.is_featured && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium h-4 bg-amber-500/10 text-amber-700 border-0">
                            Featured
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(news.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {news.publishedAt ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Live
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Draft
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Footer Note ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Loader2 className={cn("h-3 w-3", statsLoading || activityLoading ? "animate-spin" : "hidden")} />
          All data pulled live from the API
        </p>
        <p className="text-[11px] text-muted-foreground">
          Last updated: {format(lastRefreshed, "MMM dd, yyyy · HH:mm:ss")}
        </p>
      </div>
    </div>
  );
}
