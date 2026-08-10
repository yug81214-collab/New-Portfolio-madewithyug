import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Lock,
  Mail,
  Copy,
  Check,
  Loader2,
  X,
  Key,
} from "lucide-react";
import {
  adminAcceptInvitation,
  adminDeleteAdmin,
  adminInviteAdmin,
  adminListAdmins,
  adminRevokeInvitation,
  adminUpdateAdminStatus,
} from "@/lib/admin.functions";
import { PERMISSION_GROUPS, PermissionName, ALL_PERMISSIONS } from "@/lib/cms-store";

export function AdminsPanel() {
  const qc = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: () => adminListAdmins(),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin_users"] });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "disabled" }) =>
      adminUpdateAdminStatus({ data: { id, status } }),
    onSuccess: invalidate,
  });

  const revokeInv = useMutation({
    mutationFn: (id: string) => adminRevokeInvitation({ data: { id } }),
    onSuccess: invalidate,
  });

  const deleteAdmin = useMutation({
    mutationFn: (id: string) => adminDeleteAdmin({ data: { id } }),
    onSuccess: invalidate,
  });

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Shield className="h-5 w-5 text-purple-400" /> Administrator Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite, configure access rights, and manage active sessions for system administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAcceptModal(true)}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Key className="h-3.5 w-3.5 text-[#7ef0e2]" /> Redeem Invite Code
          </button>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="btn-radial inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite New Admin
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading admin users…</p>
      )}

      {/* Active Administrators Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Administrators ({data?.admins.length ?? 0})
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.admins.map((admin) => (
            <div
              key={admin.id}
              className="glass rounded-2xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold">{admin.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>

                  {admin.is_owner ? (
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                      Owner
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        admin.status === "active"
                          ? "bg-[#2fd3c6]/20 text-[#7ef0e2]"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {admin.status}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p>
                    <span className="text-foreground font-medium">Role:</span> {admin.role}
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Permissions:</span>{" "}
                    {admin.is_owner ? "ALL (26)" : `${admin.permissions?.length ?? 0} flags`}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Last active:{" "}
                    {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!admin.is_owner && (
                <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggleStatus.mutate({
                        id: admin.id,
                        status: admin.status === "active" ? "disabled" : "active",
                      })
                    }
                    className="glass flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    {admin.status === "active" ? (
                      <>
                        <UserX className="h-3 w-3 text-destructive" /> Disable
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 text-[#7ef0e2]" /> Enable
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove administrator "${admin.name}"?`)) {
                        deleteAdmin.mutate(admin.id);
                      }
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete Administrator"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {(data?.invitations.length ?? 0) > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Invitations (
            {data?.invitations.filter((i) => i.status === "pending").length ?? 0})
          </h3>

          <div className="space-y-3">
            {data?.invitations.map((inv) => (
              <div
                key={inv.id}
                className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {inv.name} <span className="text-xs text-muted-foreground">({inv.email})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role: <span className="text-foreground">{inv.role}</span> · Invited by{" "}
                    {inv.created_by}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#7ef0e2] bg-black/40 px-3 py-1 rounded-full border border border-[#016764]">
                    {inv.invite_code}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyInvite(inv.invite_code)}
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                  >
                    {copiedCode === inv.invite_code ? (
                      <Check className="h-3 w-3 text-[#7ef0e2]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedCode === inv.invite_code ? "Copied Code" : "Copy Code"}
                  </button>

                  {inv.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => revokeInv.mutate(inv.id)}
                      className="rounded-full px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            invalidate();
          }}
        />
      )}

      {/* Redeem Accept Invite Modal */}
      {showAcceptModal && (
        <AcceptInviteModal
          onClose={() => setShowAcceptModal(false)}
          onSuccess={() => {
            setShowAcceptModal(false);
            invalidate();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Content Manager");
  const [selectedPerms, setSelectedPerms] = useState<PermissionName[]>([
    ...(PERMISSION_GROUPS["Content Manager"] || []),
  ]);

  const invite = useMutation({
    mutationFn: () => adminInviteAdmin({ data: { name, email, role, permissions: selectedPerms } }),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (PERMISSION_GROUPS[newRole]) {
      setSelectedPerms([...PERMISSION_GROUPS[newRole]!]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass glow-teal w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-400" /> Invite Administrator
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@agency.com"
              className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Permission Group Preset
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-black/80 px-4 py-3 text-sm outline-none focus:border-[#016764]"
            >
              {Object.keys(PERMISSION_GROUPS).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name || !email || invite.isPending}
            onClick={() => invite.mutate()}
            className="btn-radial rounded-full px-6 py-2.5 text-xs font-medium disabled:opacity-60"
          >
            {invite.isPending ? "Generating Invite…" : "Generate Invitation Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AcceptInviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const accept = useMutation({
    mutationFn: () => adminAcceptInvitation({ data: { code, secret } }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => setError(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass glow-teal w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-[#7ef0e2]" /> Redeem Invitation Code
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Invitation Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. inv-xxxxxxxxxxxx"
              className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Set Password / Access Key
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-[#016764]"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!code || !secret || accept.isPending}
            onClick={() => accept.mutate()}
            className="btn-radial rounded-full px-6 py-2.5 text-xs font-medium disabled:opacity-60"
          >
            {accept.isPending ? "Accepting…" : "Accept & Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
