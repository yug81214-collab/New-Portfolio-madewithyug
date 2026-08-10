import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Search, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { adminListAuditLogs } from "@/lib/admin.functions";

export function AuditLogsPanel() {
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin_audit_logs"],
    queryFn: () => adminListAuditLogs(),
    refetchInterval: 10000,
  });

  const filteredLogs = logs?.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.admin_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Activity className="h-5 w-5 text-[#7ef0e2]" /> System Audit &amp; Activity Log
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable server-side event tracking log of all administrative actions and security
            events.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity logs…"
            className="w-full rounded-xl border border-border bg-white/[0.04] pl-10 pr-4 py-2 text-xs outline-none focus:border-[#016764]"
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading activity logs…</p>
      )}

      {!isLoading && filteredLogs?.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No audit logs matching your query.</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-border/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource Target</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground/80 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    {log.admin_name}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono text-[11px] text-[#7ef0e2] bg-[#016764]/20 px-2 py-0.5 rounded-md border border-[#016764]">
                      {log.action}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-muted-foreground">
                    {log.resource}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {log.result === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle className="h-3 w-3" /> SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                        <XCircle className="h-3 w-3" /> {log.result}
                      </span>
                    )}
                  </td>

                  <td
                    className="px-4 py-3 text-muted-foreground max-w-xs truncate"
                    title={log.details}
                  >
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
