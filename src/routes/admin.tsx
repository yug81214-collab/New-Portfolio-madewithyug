import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  UserCheck,
  Wrench,
  Video,
  Layers,
  Inbox,
  Image,
  Shield,
  KeyRound,
  Activity,
  Settings as SettingsIcon,
  ExternalLink,
  Lock,
  LogOut,
  Loader2,
  Menu,
  X,
  User,
} from "lucide-react";
import { adminLock, adminStatus } from "@/lib/admin.functions";
import type { PermissionName } from "@/lib/cms-store";
import { UnlockScreen } from "@/components/admin/UnlockScreen";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { IntroductionPanel } from "@/components/admin/IntroductionPanel";
import { SoftwarePanel } from "@/components/admin/SoftwarePanel";
import { VideosPanel } from "@/components/admin/VideosPanel";
import { BeforeAfterPanel } from "@/components/admin/BeforeAfterPanel";
import { SubmissionsPanel } from "@/components/admin/SubmissionsPanel";
import { MediaLibraryPanel } from "@/components/admin/MediaLibraryPanel";
import { AdminsPanel } from "@/components/admin/AdminsPanel";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { AuditLogsPanel } from "@/components/admin/AuditLogsPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Private Control Panel — Admin CMS" },
      { name: "description", content: "Backend-controlled private CMS." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "intro", label: "Introduction CMS", icon: UserCheck },
  { id: "software", label: "Software & Keywords", icon: Wrench },
  { id: "videos", label: "Videos & Portfolio", icon: Video },
  { id: "before_after", label: "Before & After", icon: Layers },
  { id: "briefs", label: "Client Submissions", icon: Inbox },
  { id: "media", label: "Media Library", icon: Image },
  { id: "admins", label: "Administrators", icon: Shield },
  { id: "permissions", label: "Permission Matrix", icon: KeyRound },
  { id: "audit", label: "Activity Logs", icon: Activity },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

function AdminPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const status = useQuery({
    queryKey: ["admin_status"],
    queryFn: async () => {
      try {
        return await adminStatus();
      } catch (err) {
        return {
          unlocked: false,
          adminId: "",
          adminName: "",
          adminEmail: "",
          role: "",
          isOwner: false,
          permissions: [] as PermissionName[],
        };
      }
    },
    retry: false,
    staleTime: 0,
  });

  const lock = useMutation({
    mutationFn: async () => {
      try {
        await adminLock(); // clear backend session cookie
      } catch (e) {
        console.error("Logout error:", e);
      }
    },
    onSuccess: () => {
      qc.clear();
      void status.refetch();
    },
  });

  if (status.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-[#7ef0e2]" />
      </main>
    );
  }

  if (!status.data?.unlocked) {
    return <UnlockScreen onUnlocked={() => void status.refetch()} />;
  }

  const activeNav = SIDEBAR_NAV.find((n) => n.id === activeTab) || SIDEBAR_NAV[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Topbar Bar */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-border z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-xs">
            YJ
          </span>
          <span className="text-sm font-semibold tracking-tight">Admin CMS</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Modern SaaS CMS Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 shrink-0 bg-black/80 backdrop-blur-xl border-r border-border p-5 flex flex-col justify-between transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Badge */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#016764] text-[#7ef0e2] font-bold text-sm shadow-lg">
                CMS
              </span>
              <div>
                <h1 className="text-sm font-bold tracking-tight">Portfolio Admin</h1>
                <p className="text-[10px] text-muted-foreground">Backend Controlled</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#2fd3c6] animate-pulse" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Active Session Info */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          <div className="glass rounded-xl p-3 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[#7ef0e2]">
              <User className="h-4 w-4" />
            </span>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold truncate">{status.data.adminName || "Owner"}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {status.data.role || "Owner Access"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="glass flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-medium hover:bg-white/10"
            >
              <ExternalLink className="h-3 w-3" /> View Site
            </Link>

            <button
              type="button"
              onClick={() => lock.mutate()}
              className="glass inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium text-destructive hover:bg-destructive/10"
              title="Lock Admin Panel"
            >
              <LogOut className="h-3 w-3" /> Lock
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {/* Main Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{activeNav.label}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Server-side authenticated control panel endpoint for {activeNav.label.toLowerCase()}.
            </p>
          </div>
        </header>

        {/* Active Panel View */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "dashboard" && (
            <AdminDashboard status={status.data} onNavigate={(t) => setActiveTab(t)} />
          )}
          {activeTab === "intro" && <IntroductionPanel />}
          {activeTab === "software" && <SoftwarePanel />}
          {activeTab === "videos" && <VideosPanel kind="short" />}
          {activeTab === "before_after" && <BeforeAfterPanel />}
          {activeTab === "briefs" && <SubmissionsPanel />}
          {activeTab === "media" && <MediaLibraryPanel />}
          {activeTab === "admins" && <AdminsPanel />}
          {activeTab === "permissions" && <PermissionMatrix />}
          {activeTab === "audit" && <AuditLogsPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}
