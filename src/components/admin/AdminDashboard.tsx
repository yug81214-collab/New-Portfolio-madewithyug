import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FileText,
  ImageIcon,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { AdminSubmission, adminGetDashboardStats } from "@/lib/admin.functions";
import { AuditLogEntry as AuditLog } from "@/lib/cms-store";

type DashboardProps = {
  status?: {
    adminName?: string;
    role?: string;
    isOwner?: boolean;
    permissions?: string[];
  };
  data?: {
    totalSubmissions: number;
    unreadSubmissions: number;
    totalBeforeAfter: number;
    totalMedia: number;
    activeAdmins: number;
    recentAuditLogs: AuditLog[];
    recentSubmissions: AdminSubmission[];
  };
  isLoading?: boolean;
  onNavigate: (tab: string) => void;
};

export function AdminDashboard({
  status,
  data: propData,
  isLoading: propIsLoading,
  onNavigate,
}: DashboardProps) {
  const statsQuery = useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: () => adminGetDashboardStats(),
    enabled: !propData,
  });

  const data = propData || statsQuery.data;
  const isLoading = propIsLoading ?? statsQuery.isLoading;

  const adminName = status?.adminName || "Owner";
  const isOwner = status?.isOwner ?? true;
  const role = status?.role || "Owner Access";

  const cards = [
    {
      title: "Client Leads & Briefs",
      value: data?.totalSubmissions ?? 0,
      badge: data?.unreadSubmissions ? `${data.unreadSubmissions} New` : null,
      icon: FileText,
      tab: "briefs",
      color: "from-teal-500/20 to-emerald-500/10",
    },
    {
      title: "Before & After Studies",
      value: data?.totalBeforeAfter ?? 0,
      icon: Sparkles,
      tab: "before_after",
      color: "from-blue-500/20 to-teal-500/10",
    },
    {
      title: "Media Library Assets",
      value: data?.totalMedia ?? 0,
      icon: ImageIcon,
      tab: "media",
      color: "from-purple-500/20 to-pink-500/10",
    },
    {
      title: "Active Admin Accounts",
      value: data?.activeAdmins ?? 0,
      icon: Users,
      tab: "admins",
      color: "from-amber-500/20 to-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass glow-teal relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full border border-[#2fd3c6]/40 bg-[#016764]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#7ef0e2]">
                {isOwner ? "Owner Portal" : `${role} Workspace`}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {adminName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Manage portfolio content, client submissions, team permissions and security.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("intro")}
              className="btn-radial px-4 py-2 text-xs font-medium rounded-full"
            >
              Edit Introduction
            </button>
            <button
              type="button"
              onClick={() => onNavigate("media")}
              className="glass px-4 py-2 text-xs font-medium rounded-full hover:bg-white/10"
            >
              Upload Assets
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onNavigate(c.tab)}
            className="glass hover:border-white/20 cursor-pointer rounded-2xl p-5 transition-all group relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-xl bg-white/5 p-2.5 text-foreground border border-white/10">
                <c.icon className="h-5 w-5 text-[#7ef0e2]" />
              </span>

              {c.badge ? (
                <span className="rounded-full bg-[#2fd3c6]/20 border border-[#2fd3c6]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#7ef0e2] animate-pulse">
                  {c.badge}
                </span>
              ) : (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>

            <div className="relative z-10 mt-4">
              <h3 className="text-3xl font-bold tracking-tight">{isLoading ? "…" : c.value}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Links */}
        <div className="glass rounded-2xl p-6 lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7ef0e2]" /> Quick Navigation
          </h3>

          <div className="space-y-2">
            {[
              { label: "Introduction CMS", tab: "intro", desc: "Bio, stats, skills" },
              {
                label: "Software & Keywords",
                tab: "software",
                desc: "After Effects, Premiere, Resolve skills",
              },
              { label: "Before & After Projects", tab: "before_after", desc: "Case studies" },
              { label: "Portfolio Videos", tab: "videos", desc: "Shorts & long form" },
              { label: "Client Brief Submissions", tab: "briefs", desc: "Inbound leads" },
              { label: "Media Library", tab: "media", desc: "Upload images/videos" },
              { label: "Admin Team & Invites", tab: "admins", desc: "Manage access" },
              { label: "Permission Matrix", tab: "permissions", desc: "Role configuration" },
              { label: "Audit & Security Logs", tab: "audit", desc: "Activity trail" },
              { label: "Global Settings", tab: "settings", desc: "Site configuration" },
            ].map((act) => (
              <button
                key={act.tab}
                type="button"
                onClick={() => onNavigate(act.tab)}
                className="w-full text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-border/50 p-3 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-medium text-foreground group-hover:text-[#7ef0e2]">
                    {act.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{act.desc}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Client Submissions */}
        <div className="glass rounded-2xl p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Clock className="h-4 w-4 text-[#7ef0e2]" /> Recent Briefs
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("briefs")}
              className="text-xs text-[#7ef0e2] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {(!data?.recentSubmissions || data.recentSubmissions.length === 0) && (
              <p className="text-xs text-muted-foreground">No recent submissions found.</p>
            )}

            {data?.recentSubmissions?.map((sub: AdminSubmission) => (
              <div
                key={sub.id}
                onClick={() => onNavigate("briefs")}
                className="glass hover:border-white/20 cursor-pointer rounded-xl p-3.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">
                    {sub.name} {sub.company ? `(${sub.company})` : ""}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      sub.status === "NEW"
                        ? "bg-[#2fd3c6]/20 text-[#7ef0e2]"
                        : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    {sub.status || "NEW"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                  {sub.description}
                </p>
                <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                  {new Date(sub.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Activity */}
        <div className="glass rounded-2xl p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Activity className="h-4 w-4 text-[#7ef0e2]" /> Audit Feed
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("audit")}
              className="text-xs text-[#7ef0e2] hover:underline"
            >
              Full log
            </button>
          </div>

          <div className="space-y-3">
            {(!data?.recentAuditLogs || data.recentAuditLogs.length === 0) && (
              <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
            )}

            {data?.recentAuditLogs?.slice(0, 6).map((log: AuditLog) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{log.action}</p>
                  <p className="text-[11px] text-muted-foreground">{log.details}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    By {log.admin_name} • {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    log.result === "SUCCESS"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {log.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
