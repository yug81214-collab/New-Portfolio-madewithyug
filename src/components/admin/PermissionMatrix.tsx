import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Shield, Lock, Save, Loader2 } from "lucide-react";
import { adminListAdmins, adminUpdateAdminPermissions } from "@/lib/admin.functions";
import { ALL_PERMISSIONS, PERMISSION_GROUPS, PermissionName, AdminUser } from "@/lib/cms-store";

export function PermissionMatrix() {
  const qc = useQueryClient();
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: () => adminListAdmins(),
  });

  const admins = data?.admins ?? [];
  const activeAdmin = admins.find((a) => a.id === selectedAdminId) || admins[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Shield className="h-5 w-5 text-purple-400" /> Granular Permission Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure individual server-side API execution rights for every invited administrator.
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading permission matrix…</p>
      )}

      {!isLoading && activeAdmin && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Admin Selector List */}
          <div className="glass rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-2 mb-2">
              Select Administrator
            </p>
            {admins.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAdminId(a.id)}
                className={`w-full text-left rounded-xl p-3 text-xs transition-all flex items-center justify-between ${
                  (selectedAdminId || admins[0]?.id) === a.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-lg"
                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-[10px] opacity-75">{a.email}</p>
                </div>
                {a.is_owner && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] text-amber-300 font-bold uppercase">
                    Owner
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Permission Matrix Editor for Active Admin */}
          <AdminPermissionsEditor
            admin={activeAdmin}
            onSaved={() => void qc.invalidateQueries({ queryKey: ["admin_users"] })}
          />
        </div>
      )}
    </div>
  );
}

function AdminPermissionsEditor({ admin, onSaved }: { admin: AdminUser; onSaved: () => void }) {
  const [roleGroup, setRoleGroup] = useState<string>(admin.role || "Custom");
  const [perms, setPerms] = useState<PermissionName[]>(admin.permissions || []);
  const [saved, setSaved] = useState(false);

  const update = useMutation({
    mutationFn: () =>
      adminUpdateAdminPermissions({
        data: { id: admin.id, role: roleGroup, permissions: perms },
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    },
  });

  const togglePerm = (p: PermissionName) => {
    if (admin.is_owner) return; // Owner cannot be restricted
    if (perms.includes(p)) {
      setPerms((prev) => prev.filter((item) => item !== p));
    } else {
      setPerms((prev) => [...prev, p]);
    }
  };

  const applyPresetGroup = (groupName: string) => {
    setRoleGroup(groupName);
    const preset = PERMISSION_GROUPS[groupName];
    if (preset) {
      setPerms([...preset]);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h3 className="text-base font-semibold">{admin.name}</h3>
          <p className="text-xs text-muted-foreground">
            {admin.email} · {admin.role}
          </p>
        </div>

        {admin.is_owner && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
            <Lock className="h-3.5 w-3.5" /> Owner Account (Unrestricted)
          </span>
        )}
      </div>

      {/* Preset Role Picker */}
      {!admin.is_owner && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Role Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PERMISSION_GROUPS).map((groupName) => (
              <button
                key={groupName}
                type="button"
                onClick={() => applyPresetGroup(groupName)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  roleGroup === groupName
                    ? "bg-[#2fd3c6] text-black font-semibold"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {groupName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permission Checkbox Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Individual Permission Flags ({perms.length} / {ALL_PERMISSIONS.length})
        </label>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {ALL_PERMISSIONS.map((perm) => {
            const isChecked = admin.is_owner || perms.includes(perm);
            return (
              <div
                key={perm}
                onClick={() => togglePerm(perm)}
                className={`glass p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? "border-[#016764] bg-[#016764]/20 text-foreground"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <div
                  className={`grid h-5 w-5 place-items-center rounded-md border ${
                    isChecked
                      ? "bg-[#2fd3c6] border-[#2fd3c6] text-black"
                      : "border-border bg-white/5"
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-mono font-medium tracking-tight">{perm}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      {!admin.is_owner && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="btn-radial inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium"
          >
            {update.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Permissions
          </button>

          {saved && (
            <span className="flex items-center gap-1 text-xs text-[#7ef0e2]">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      )}
    </div>
  );
}
