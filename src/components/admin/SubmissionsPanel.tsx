import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle2,
  FileText,
  User,
  Clock,
  Building,
  Phone,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  adminDeleteSubmission,
  adminListSubmissions,
  adminUpdateSubmission,
  type AdminSubmission as Submission,
} from "@/lib/admin.functions";
import { ClientSubmissionStatus } from "@/lib/cms-store";

const STATUS_COLORS: Record<ClientSubmissionStatus, string> = {
  NEW: "bg-[#2fd3c6]/20 text-[#7ef0e2] border-[#016764]",
  CONTACTED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  QUALIFIED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  CONVERTED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CLOSED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  SPAM: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const ALL_STATUSES: ClientSubmissionStatus[] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
  "SPAM",
];

export function SubmissionsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["admin_submissions"],
    queryFn: () => adminListSubmissions(),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin_submissions"] });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteSubmission({ data: { id } }),
    onSuccess: invalidate,
  });

  const total = data?.length ?? 0;
  const unread = data?.filter((d) => !d.is_read).length ?? 0;
  const newLeads = data?.filter((d) => d.status === "NEW").length ?? 0;

  const filteredData = data?.filter((row) => {
    const q = search.toLowerCase();
    const matchesQuery =
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      (row.company && row.company.toLowerCase().includes(q)) ||
      (row.description && row.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || row.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Company",
      "Email",
      "Phone",
      "Video Type",
      "Deadline",
      "Budget",
      "Status",
      "Created At",
      "Description",
    ];
    const rows = data.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.company || "").replace(/"/g, '""')}"`,
      d.email,
      d.phone || "",
      `"${(d.video_type || "").replace(/"/g, '""')}"`,
      d.deadline || "",
      d.budget || "",
      d.status || "NEW",
      d.created_at,
      `"${(d.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `client_briefs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Client Briefs", value: total },
          { label: "New Status Leads", value: newLeads, color: "text-[#7ef0e2]" },
          { label: "Unread Submissions", value: unread, color: "text-amber-300" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-xs tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${s.color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-2xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email or project description…"
            className="w-full rounded-xl border border-border bg-white/[0.04] pl-10 pr-4 py-2 text-xs outline-none focus:border-[#016764]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({total})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = data?.filter((d) => d.status === st).length ?? 0;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === st
                    ? "bg-[#2fd3c6] text-black font-bold"
                    : "bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}

          <button
            type="button"
            onClick={exportCSV}
            className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium hover:bg-white/10 ml-2"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading client briefs…</p>
      )}

      {!isLoading && filteredData?.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No client submissions found matching your filters.
          </p>
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-4">
        {filteredData?.map((row) => (
          <SubmissionCard
            key={row.id}
            row={row}
            onSaved={invalidate}
            onDelete={() => {
              if (confirm(`Delete brief submission from "${row.name}"?`)) {
                remove.mutate(row.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SubmissionCard({
  row,
  onSaved,
  onDelete,
}: {
  row: Submission;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(row.internal_notes || "");
  const [status, setStatus] = useState<ClientSubmissionStatus>(row.status || "NEW");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const update = useMutation({
    mutationFn: (patch: Partial<Submission>) =>
      adminUpdateSubmission({ data: { id: row.id, patch } }),
    onSuccess: onSaved,
  });

  return (
    <article
      className={`glass rounded-2xl p-6 transition-all space-y-4 ${
        !row.is_read ? "border-l-4 border-l-[#2fd3c6] glow-teal" : "opacity-90"
      }`}
    >
      {/* Top Row Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">
              {row.name}
              {row.company ? ` · ${row.company}` : ""}
            </h3>
            {!row.is_read && (
              <span className="rounded-full bg-[#2fd3c6]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#7ef0e2] uppercase">
                UNREAD
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {new Date(row.created_at).toLocaleString()}
            </span>
            {row.video_type && <span>· {row.video_type}</span>}
            {row.budget && (
              <span className="flex items-center gap-0.5 text-[#7ef0e2]">
                <DollarSign className="h-3 w-3" /> {row.budget}
              </span>
            )}
          </p>
        </div>

        {/* Status Pipeline & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => {
              const newSt = e.target.value as ClientSubmissionStatus;
              setStatus(newSt);
              update.mutate({ status: newSt, is_read: true });
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer ${
              STATUS_COLORS[status] || STATUS_COLORS.NEW
            }`}
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-card text-foreground">
                Status: {st}
              </option>
            ))}
          </select>

          <a
            href={`mailto:${row.email}?subject=Re:%20Portfolio%20Inquiry%20-%20${encodeURIComponent(
              row.name,
            )}`}
            className="btn-radial inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
          >
            <Mail className="h-3 w-3" /> Email Lead
          </a>

          <button
            type="button"
            onClick={() => update.mutate({ is_read: !row.is_read })}
            className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {row.is_read ? "Mark Unread" : "Mark Read"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete Brief"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Brief Details Grid */}
      <div className="grid gap-3 text-xs sm:grid-cols-3 bg-white/[0.02] p-4 rounded-xl border border-border/30">
        <div>
          <span className="text-muted-foreground block text-[11px]">Contact Email</span>
          <a href={`mailto:${row.email}`} className="font-medium text-foreground hover:underline">
            {row.email}
          </a>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px]">Phone / WhatsApp</span>
          <span className="font-medium text-foreground">{row.phone || "Not provided"}</span>
        </div>

        <div>
          <span className="text-muted-foreground block text-[11px]">Timeline / Deadline</span>
          <span className="font-medium text-foreground">{row.deadline || "Flexible"}</span>
        </div>

        {row.reference && (
          <div className="sm:col-span-3 border-t border-border/30 pt-2">
            <span className="text-muted-foreground block text-[11px]">
              Reference / Inspiration Link
            </span>
            <a
              href={row.reference}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#7ef0e2] hover:underline break-all"
            >
              {row.reference}
            </a>
          </div>
        )}
      </div>

      {/* Message Body */}
      {row.description && (
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Project Description &amp; Scope
          </span>
          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap bg-black/30 p-4 rounded-xl border border-border/40">
            {row.description}
          </p>
        </div>
      )}

      {/* Internal Admin Notes (Server-Only, Never Exposed to Public) */}
      <div className="space-y-2 pt-2 border-t border-border/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Private Internal Admin Notes (Server Only)
          </span>

          {!isEditingNotes && (
            <button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              className="text-[11px] text-[#7ef0e2] hover:underline"
            >
              {notes ? "Edit Notes" : "+ Add Note"}
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes visible only to admins…"
              className="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs outline-none focus:border-amber-400"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  update.mutate({ internal_notes: notes });
                  setIsEditingNotes(false);
                }}
                className="btn-radial rounded-full px-4 py-1.5 text-xs font-medium"
              >
                Save Internal Note
              </button>
              <button
                type="button"
                onClick={() => setIsEditingNotes(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          notes && (
            <p className="text-xs text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 italic">
              "{notes}"
            </p>
          )
        )}
      </div>
    </article>
  );
}
