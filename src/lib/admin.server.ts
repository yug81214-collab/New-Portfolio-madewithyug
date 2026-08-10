import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { PermissionName, cmsStore } from "./cms-store";

export type AdminSessionData = {
  unlocked?: boolean;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  role?: string;
  isOwner?: boolean;
  permissions?: PermissionName[];
};

export interface AdminSession {
  data: AdminSessionData;
  update(newData: Partial<AdminSessionData>): Promise<void>;
  clear(): Promise<void>;
}

const COOKIE_NAME = "cms_admin_session";

export function secretMatches(input: string, target: string): boolean {
  if (!input || !target) return false;
  return input.trim() === target.trim();
}

export async function getAdminSession(): Promise<AdminSession> {
  let sessionData: AdminSessionData = {};

  try {
    const raw = getCookie(COOKIE_NAME);
    if (raw) {
      sessionData = JSON.parse(decodeURIComponent(raw));
    }
  } catch (err) {
    sessionData = {};
  }

  return {
    data: sessionData,
    async update(newData: Partial<AdminSessionData>) {
      const updated = { ...sessionData, ...newData };
      sessionData = updated;
      try {
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(updated)), {
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      } catch (e) {
        console.error("Failed to set admin session cookie:", e);
      }
    },
    async clear() {
      sessionData = {};
      try {
        deleteCookie(COOKIE_NAME, { path: "/" });
      } catch (e) {
        console.error("Failed to clear admin session cookie:", e);
      }
    },
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session.data.unlocked) {
    throw new Response("Unauthorized: Admin Session Required", { status: 401 });
  }
  return session;
}

export async function requirePermission(permission: PermissionName): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.data.isOwner) return session;
  const perms = session.data.permissions ?? [];
  if (!perms.includes(permission)) {
    throw new Response(`Forbidden: Permission ${permission} Required`, { status: 403 });
  }
  return session;
}

export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!session.data.isOwner) {
    throw new Response("Forbidden: Owner Privileges Required", { status: 403 });
  }
  return session;
}
