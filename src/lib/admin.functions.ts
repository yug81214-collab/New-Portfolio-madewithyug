import { createServerFn } from "@tanstack/react-start";
import {
  cmsStore,
  PermissionName,
  ALL_PERMISSIONS,
  AdminUser,
  ClientSubmissionStatus,
  IntroductionContent,
  BeforeAfterProject,
} from "./cms-store";

export type AdminVideo = {
  id: string;
  kind: "short" | "long";
  title: string;
  category: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  length_label: string;
  sort_order: number;
  is_published: boolean;
};

export type AdminSubmission = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  deadline?: string;
  video_type?: string;
  budget?: string;
  reference?: string;
  description: string;
  status: ClientSubmissionStatus;
  internal_notes?: string;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
  is_read: boolean;
  created_at: string;
};

/* ------------------------------------------------------------------ GATE & AUTH */

export const adminUnlock = createServerFn({ method: "POST" })
  .validator((data: { secret: string; email?: string }) => ({
    secret: String(data?.secret ?? "").trim(),
    email: String(data?.email ?? "")
      .trim()
      .toLowerCase(),
  }))
  .handler(async ({ data }) => {
    try {
      const { getAdminSession, secretMatches } = await import("./admin.server");
      const session = await getAdminSession();

      // 1. Check Owner Secret (from ENV or default master key)
      const rawEnvSecret = process.env["ADMIN_SECRET"] || "Yug000LivePortfolio";
      const ownerSecret = rawEnvSecret.trim().replace(/^["']|["']$/g, "");
      const inputSecret = data.secret.trim().replace(/^["']|["']$/g, "");

      if (secretMatches(inputSecret, ownerSecret)) {
        const ownerAdmin = cmsStore.getAdmins().find((a) => a.is_owner) || {
          id: "owner-1",
          name: "Yug Jha (Owner)",
          email: "jhayug29@gmail.com",
          role: "owner",
          is_owner: true,
          permissions: ALL_PERMISSIONS,
        };

        await session.update({
          unlocked: true,
          adminId: ownerAdmin.id,
          adminName: ownerAdmin.name,
          adminEmail: ownerAdmin.email,
          role: "owner",
          isOwner: true,
          permissions: ALL_PERMISSIONS,
        });

        cmsStore.logAudit(
          ownerAdmin.id,
          ownerAdmin.name,
          "ADMIN_LOGIN",
          "Owner Master Access",
          "SUCCESS",
          "Logged in with Owner Secret",
        );

        return { ok: true as const };
      }

      // 2. Check invited admin credentials
      if (data.email) {
        const admin = cmsStore.findAdminByEmail(data.email);
        if (admin && admin.status === "active" && admin.access_key_hash) {
          const inputHash = await cmsStore.hashSecret(data.secret);
          if (inputHash === admin.access_key_hash) {
            cmsStore.updateAdmin(admin.id, { last_login: new Date().toISOString() });

            await session.update({
              unlocked: true,
              adminId: admin.id,
              adminName: admin.name,
              adminEmail: admin.email,
              role: admin.role,
              isOwner: admin.is_owner,
              permissions: admin.permissions,
            });

            cmsStore.logAudit(
              admin.id,
              admin.name,
              "ADMIN_LOGIN",
              "Invited Admin Session",
              "SUCCESS",
              `Admin ${admin.name} logged in`,
            );

            return { ok: true as const };
          }
        }
      }

      // Delay brute force
      await new Promise((r) => setTimeout(r, 400));
      cmsStore.logAudit(
        "anonymous",
        data.email || "Unknown",
        "FAILED_LOGIN_ATTEMPT",
        "Admin Gate",
        "DENIED",
        "Invalid secret or credentials",
      );

      return { ok: false as const, reason: "invalid" as const };
    } catch (err) {
      console.error("Admin unlock server error:", err);
      return { ok: false as const, reason: "server_error" as const };
    }
  });

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  return {
    unlocked: session.data.unlocked === true,
    adminId: session.data.adminId || "",
    adminName: session.data.adminName || "",
    adminEmail: session.data.adminEmail || "",
    role: session.data.role || "",
    isOwner: session.data.isOwner === true,
    permissions: session.data.permissions || [],
  };
});

export const adminLock = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  if (session.data.adminId) {
    cmsStore.logAudit(
      session.data.adminId,
      session.data.adminName || "Admin",
      "ADMIN_LOGOUT",
      "Admin Gate",
      "SUCCESS",
      "Session ended by user",
    );
  }
  await session.clear();
  return { ok: true as const };
});

/* ---------------------------------------------------------------- DASHBOARD STATS */

export const adminGetDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin.server");
  await requireAdmin();

  const submissions = cmsStore.getSubmissions();
  const beforeAfter = cmsStore.getBeforeAfterProjects();
  const media = cmsStore.getMediaAssets();
  const admins = cmsStore.getAdmins();
  const auditLogs = cmsStore.getAuditLogs();

  return {
    totalSubmissions: submissions.length,
    unreadSubmissions: submissions.filter((s) => !s.is_read).length,
    totalBeforeAfter: beforeAfter.length,
    totalMedia: media.length,
    activeAdmins: admins.filter((a) => a.status === "active").length,
    recentAuditLogs: auditLogs.slice(0, 10),
    recentSubmissions: submissions.slice(0, 5),
  };
});

/* -------------------------------------------------------------- SITE SETTINGS */

export const adminGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("SETTINGS_VIEW");
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin.from("site_settings").select("key, value");
    if (!error && data) {
      return Object.fromEntries(data.map((r) => [r.key, r.value])) as Record<string, string>;
    }
  } catch (e) {
    // Fallback
  }
  return cmsStore.getSettings();
});

export const adminSaveSettings = createServerFn({ method: "POST" })
  .validator((data: { values: Record<string, string> }) => {
    const values = data?.values ?? {};
    const rows = Object.entries(values)
      .filter(([k]) => /^[a-z0-9_]{1,64}$/.test(k))
      .map(([key, value]) => ({ key, value: String(value ?? "").slice(0, 10000000) }));
    return { rows };
  })
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("SETTINGS_EDIT");

    if (data.rows.length === 0) return { ok: true as const };
    const newValues = Object.fromEntries(data.rows.map((r) => [r.key, r.value]));
    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      const { error } = await supabaseAdmin.from("site_settings").upsert(
        data.rows.map((row) => ({
          ...row,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "key" },
      );
      if (error) throw error;
    } catch (error) {
      console.error("[v0] Failed to persist site settings", error);
      throw new Error("Settings could not be saved. Please try again.");
    }

    cmsStore.saveSettings(newValues);

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "SETTINGS_UPDATED",
      "Site Settings",
      "SUCCESS",
      `Saved ${data.rows.length} setting keys`,
    );

    return { ok: true as const };
  });

/* ----------------------------------------------------------- INTRODUCTION CMS */

export const adminGetIntroduction = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("INTRODUCTION_VIEW");
  let storeIntro = cmsStore.getIntroduction();
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "introduction_data")
      .maybeSingle();
    if (!error && data?.value) {
      const dbIntro = JSON.parse(data.value) as IntroductionContent;
      storeIntro = {
        ...storeIntro,
        ...dbIntro,
      };
    }
  } catch (e) {
    // Fallback
  }
  return storeIntro;
});

export const adminSaveIntroduction = createServerFn({ method: "POST" })
  .validator((data: { patch: Partial<IntroductionContent> }) => ({ patch: data?.patch ?? {} }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("INTRODUCTION_EDIT");

    const updated = cmsStore.updateIntroduction(data.patch, session.data.adminName || "Admin");

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "introduction_data",
          value: JSON.stringify(updated),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "INTRODUCTION_UPDATED",
      "Introduction Section",
      "SUCCESS",
      "Updated introduction heading, body and media",
    );

    return { ok: true as const, data: updated };
  });

/* ----------------------------------------------------- BEFORE & AFTER PROJECTS */

export const adminListBeforeAfter = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("BEFORE_AFTER_VIEW");
  let projects = cmsStore.getBeforeAfterProjects();
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "before_after_data")
      .maybeSingle();
    if (!error && data?.value) {
      projects = JSON.parse(data.value);
    }
  } catch (e) {
    // Fallback
  }
  return projects;
});

export const adminCreateBeforeAfter = createServerFn({ method: "POST" })
  .validator((data: { title?: string; category?: string }) => ({
    title: String(data?.title ?? "New Before/After Project"),
    category: String(data?.category ?? "VSL Edit"),
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("BEFORE_AFTER_CREATE");

    const newProj = cmsStore.addBeforeAfterProject({
      title: data.title,
      category: data.category,
      description: "Standard vs edited comparison.",
      before_image: "",
      after_image: "",
      client: "Client Name",
      project_date: new Date().toISOString().slice(0, 10),
      before_retention: "20% retention",
      after_retention: "70% retention",
      notes: ["Cut dead air", "Added kinetic captions", "Punch-ins on key hooks"],
      featured: true,
      is_published: true,
      sort_order: cmsStore.getBeforeAfterProjects().length + 1,
    });

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "before_after_data",
          value: JSON.stringify(cmsStore.getBeforeAfterProjects()),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "BEFORE_AFTER_CREATED",
      "Before & After",
      "SUCCESS",
      `Created project ${newProj.title}`,
      newProj.id,
    );

    return { ok: true as const, project: newProj };
  });

export const adminSaveBeforeAfter = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: Partial<BeforeAfterProject> }) => ({
    id: String(data?.id ?? ""),
    patch: data?.patch ?? {},
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("BEFORE_AFTER_EDIT");

    const updated = cmsStore.updateBeforeAfterProject(data.id, data.patch);
    if (!updated) throw new Error("Project not found");

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "before_after_data",
          value: JSON.stringify(cmsStore.getBeforeAfterProjects()),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "BEFORE_AFTER_UPDATED",
      "Before & After",
      "SUCCESS",
      `Updated project ${updated.title}`,
      data.id,
    );

    return { ok: true as const };
  });

export const adminDeleteBeforeAfter = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("BEFORE_AFTER_DELETE");

    const success = cmsStore.deleteBeforeAfterProject(data.id);

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "before_after_data",
          value: JSON.stringify(cmsStore.getBeforeAfterProjects()),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "BEFORE_AFTER_DELETED",
      "Before & After",
      "SUCCESS",
      `Deleted project ID ${data.id}`,
      data.id,
    );

    return { ok: success };
  });

/* ------------------------------------------------------------- PORTFOLIO VIDEOS */

export const adminListVideos = createServerFn({ method: "GET" })
  .validator((data: { kind: "short" | "long" }) => ({
    kind: data?.kind === "long" ? ("long" as const) : ("short" as const),
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    await requirePermission("VIDEO_VIEW");
    let videos = cmsStore.getVideos(data.kind) as AdminVideo[];
    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      const { data: row, error } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "videos_data")
        .maybeSingle();
      if (!error && row?.value) {
        const allVideos = JSON.parse(row.value) as AdminVideo[];
        videos = allVideos.filter((v) => v.kind === data.kind);
      }
    } catch (e) {
      // Fallback
    }
    return videos;
  });

export const adminCreateVideo = createServerFn({ method: "POST" })
  .validator((data: { kind: "short" | "long"; sort_order?: number }) => ({
    kind: data?.kind === "long" ? ("long" as const) : ("short" as const),
    sort_order: Number.isFinite(data?.sort_order) ? Number(data?.sort_order) : 0,
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("VIDEO_CREATE");

    const newVid = cmsStore.createVideo(data.kind, data.sort_order);

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "videos_data",
          value: JSON.stringify([...cmsStore.getVideos("short"), ...cmsStore.getVideos("long")]),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "VIDEO_CREATED",
      "Videos / Portfolio",
      "SUCCESS",
      `Created new ${data.kind} video`,
    );

    return { ok: true as const };
  });

export const adminSaveVideo = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: Partial<AdminVideo> }) => {
    const id = String(data?.id ?? "");
    const p = data?.patch ?? {};
    const patch: Partial<AdminVideo> = {};

    if (p.kind !== undefined) patch.kind = p.kind === "long" ? "long" : "short";
    if (p.title !== undefined) patch.title = String(p.title).slice(0, 300);
    if (p.category !== undefined) patch.category = String(p.category).slice(0, 300);
    if (p.description !== undefined) patch.description = String(p.description).slice(0, 5000);
    if (p.thumbnail_url !== undefined) {
      patch.thumbnail_url = String(p.thumbnail_url).slice(0, 10000000);
    }
    if (p.video_url !== undefined) {
      patch.video_url = String(p.video_url).slice(0, 10000000);
    }
    if (p.length_label !== undefined) patch.length_label = String(p.length_label).slice(0, 100);
    if (p.sort_order !== undefined) patch.sort_order = Number(p.sort_order);
    if (p.is_published !== undefined) patch.is_published = Boolean(p.is_published);

    // Validate short-form + youtube
    if (
      patch.kind === "short" &&
      patch.video_url &&
      patch.video_url.match(/youtube\.com|youtu\.be/i)
    ) {
      throw new Error("Short form videos cannot use YouTube URLs");
    }

    return { id, patch };
  })
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("VIDEO_EDIT");

    cmsStore.saveVideo(data.id, data.patch);

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "videos_data",
          value: JSON.stringify([...cmsStore.getVideos("short"), ...cmsStore.getVideos("long")]),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "VIDEO_UPDATED",
      "Videos / Portfolio",
      "SUCCESS",
      `Saved video ID ${data.id}`,
      data.id,
    );

    return { ok: true as const };
  });

export const adminDeleteVideo = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("VIDEO_DELETE");

    cmsStore.deleteVideo(data.id);

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("site_settings").upsert(
        {
          key: "videos_data",
          value: JSON.stringify([...cmsStore.getVideos("short"), ...cmsStore.getVideos("long")]),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    } catch (e) {
      // Fallback
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "VIDEO_DELETED",
      "Videos / Portfolio",
      "SUCCESS",
      `Deleted video ID ${data.id}`,
      data.id,
    );

    return { ok: true as const };
  });

/* ----------------------------------------------------- CLIENT SUBMISSIONS / LEADS */

export const adminListSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("CLIENT_FORM_VIEW");

  let dbData = null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const res = await supabaseAdmin
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    dbData = res.data;
  } catch (e) {
    // Fallback
  }

  // Merge DB and store entries
  const storeSubs = cmsStore.getSubmissions();
  if (dbData && dbData.length > 0) {
    const map = new Map<string, AdminSubmission>();
    for (const s of storeSubs) map.set(s.id, s as AdminSubmission);
    for (const dbItem of dbData) {
      if (!map.has(dbItem.id)) {
        map.set(dbItem.id, {
          ...dbItem,
          status: (dbItem as { status?: ClientSubmissionStatus }).status || "NEW",
        });
      }
    }
    return Array.from(map.values()) as AdminSubmission[];
  }

  return storeSubs as AdminSubmission[];
});

export const adminUpdateSubmission = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: Partial<AdminSubmission> }) => ({
    id: String(data?.id ?? ""),
    patch: data?.patch ?? {},
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("CLIENT_FORM_VIEW");

    const updated = cmsStore.updateSubmission(data.id, data.patch);

    // Also update DB if present
    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      if (data.patch.is_read !== undefined) {
        await supabaseAdmin
          .from("submissions")
          .update({ is_read: data.patch.is_read })
          .eq("id", data.id);
      }
    } catch (e) {
      // Ignored
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "CLIENT_SUBMISSION_UPDATED",
      "Client Submissions",
      "SUCCESS",
      `Updated brief status or notes for ID ${data.id}`,
      data.id,
    );

    return { ok: true as const, submission: updated };
  });

export const adminDeleteSubmission = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("CLIENT_FORM_DELETE");

    cmsStore.deleteSubmission(data.id);

    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("submissions").delete().eq("id", data.id);
    } catch (e) {
      // Ignored
    }

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "CLIENT_SUBMISSION_DELETED",
      "Client Submissions",
      "SUCCESS",
      `Deleted brief ID ${data.id}`,
      data.id,
    );

    return { ok: true as const };
  });

export const publicSubmitBrief = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => ({
    name: String(data?.name ?? "").slice(0, 150),
    company: String(data?.company ?? "").slice(0, 150),
    email: String(data?.email ?? "").slice(0, 200),
    phone: String(data?.phone ?? "").slice(0, 100),
    deadline: String(data?.deadline ?? "").slice(0, 100),
    video_type: String(data?.video_type ?? "").slice(0, 200),
    budget: String(data?.budget ?? "").slice(0, 100),
    reference: String(data?.reference ?? "").slice(0, 500),
    description: String(data?.description ?? "").slice(0, 5000),
  }))
  .handler(async ({ data }) => {
    if (!data.name || !data.email || !data.description) {
      throw new Error("Name, email and brief description are required.");
    }

    const sub = cmsStore.addSubmission({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      deadline: data.deadline,
      video_type: data.video_type,
      budget: data.budget,
      reference: data.reference,
      description: data.description,
    });

    // Mirror to Supabase if connected
    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      await supabaseAdmin.from("submissions").insert({
        id: sub.id,
        name: sub.name,
        company: sub.company,
        email: sub.email,
        phone: sub.phone,
        deadline: sub.deadline,
        video_type: sub.video_type,
        reference: sub.reference,
        description: sub.description,
        is_read: false,
      });
    } catch (e) {
      // Ignored if local fallback
    }

    cmsStore.logAudit(
      "PUBLIC_VISITOR",
      data.name,
      "CLIENT_BRIEF_SUBMITTED",
      "Client Contact Form",
      "SUCCESS",
      `New brief received from ${data.email}`,
      sub.id,
    );

    return { ok: true as const, id: sub.id };
  });

/* ------------------------------------------------------------- MEDIA LIBRARY */

export const adminListMedia = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("MEDIA_VIEW");
  return cmsStore.getMediaAssets();
});

export const adminCreateUploadUrl = createServerFn({ method: "POST" })
  .validator((data: { ext: string }) => ({
    ext: (String(data?.ext ?? "jpg").match(/[a-z0-9]{1,8}/i)?.[0] ?? "jpg").toLowerCase(),
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    await requirePermission("MEDIA_UPLOAD");
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    const path = `portfolio-media/${crypto.randomUUID()}.${data.ext}`;

    try {
      try {
        await supabaseAdmin.storage.createBucket("site-media", { public: true });
      } catch {
        // Bucket may already exist
      }

      const { data: signed, error } = await supabaseAdmin.storage
        .from("site-media")
        .createSignedUploadUrl(path);
      if (error || !signed) throw error;
      return { path, token: signed.token };
    } catch {
      return { path, token: "mock-token" };
    }
  });

export const adminRegisterMediaAsset = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => ({
    filename: String(data?.filename ?? "file.jpg"),
    file_type: String(data?.file_type ?? "image/jpeg"),
    size_bytes: Number(data?.size_bytes ?? 100000),
    url: String(data?.url ?? ""),
    storage_path: String(data?.storage_path ?? ""),
    category: ((data?.category as string) || "image") as "image" | "video" | "document",
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("MEDIA_UPLOAD");

    const asset = cmsStore.addMediaAsset({
      ...data,
      category: (data.category === "video"
        ? "video"
        : data.category === "image"
          ? "image"
          : "other") as "image" | "video" | "thumbnail" | "other",
      usage_count: 1,
      uploaded_by: session.data.adminName || "Admin",
    });

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "MEDIA_UPLOADED",
      "Media Library",
      "SUCCESS",
      `Uploaded asset ${asset.filename}`,
      asset.id,
    );

    return { ok: true as const, asset };
  });

export const adminDeleteMediaAsset = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("MEDIA_DELETE");

    cmsStore.deleteMediaAsset(data.id);

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "MEDIA_DELETED",
      "Media Library",
      "SUCCESS",
      `Deleted media asset ID ${data.id}`,
      data.id,
    );

    return { ok: true as const };
  });

/* ------------------------------------------------ ADMINS & INVITATIONS CMS */

export const adminListAdmins = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("ADMIN_VIEW");

  return {
    admins: cmsStore.getAdmins().map(({ access_key_hash, ...rest }) => rest),
    invitations: cmsStore.getInvitations(),
  };
});

export const adminInviteAdmin = createServerFn({ method: "POST" })
  .validator(
    (data: { name: string; email: string; role: string; permissions: PermissionName[] }) => ({
      name: String(data?.name ?? "").trim(),
      email: String(data?.email ?? "").trim(),
      role: String(data?.role ?? "Content Manager"),
      permissions: Array.isArray(data?.permissions) ? (data.permissions as PermissionName[]) : [],
    }),
  )
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("ADMIN_INVITE");

    if (!data.name || !data.email) {
      throw new Error("Admin name and email are required");
    }

    const invitation = cmsStore.createInvitation(
      data.name,
      data.email,
      data.role,
      data.permissions,
      session.data.adminName || "Owner",
    );

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "ADMIN_INVITED",
      "Admin Management",
      "SUCCESS",
      `Invited ${data.name} (${data.email}) as ${data.role}`,
      invitation.id,
    );

    return { ok: true as const, invitation };
  });

export const adminRevokeInvitation = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("ADMIN_INVITE");

    cmsStore.revokeInvitation(data.id);

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "INVITATION_REVOKED",
      "Admin Management",
      "SUCCESS",
      `Revoked invitation ID ${data.id}`,
      data.id,
    );

    return { ok: true as const };
  });

export const adminAcceptInvitation = createServerFn({ method: "POST" })
  .validator((data: { code: string; secret: string }) => ({
    code: String(data?.code ?? "").trim(),
    secret: String(data?.secret ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    if (!data.code || !data.secret || data.secret.length < 6) {
      throw new Error("Invitation code and password (min 6 chars) required.");
    }

    const newAdmin = await cmsStore.acceptInvitation(data.code, data.secret);
    if (!newAdmin) {
      throw new Error("Invalid or expired invitation code.");
    }

    cmsStore.logAudit(
      newAdmin.id,
      newAdmin.name,
      "INVITATION_ACCEPTED",
      "Admin Management",
      "SUCCESS",
      `Admin account created for ${newAdmin.email}`,
    );

    return { ok: true as const, email: newAdmin.email };
  });

export const adminUpdateAdminStatus = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: "active" | "disabled" }) => ({
    id: String(data?.id ?? ""),
    status: data?.status === "disabled" ? ("disabled" as const) : ("active" as const),
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("ADMIN_DISABLE");

    const updated = cmsStore.updateAdmin(data.id, { status: data.status });
    if (!updated) throw new Error("Admin user not found.");

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "ADMIN_STATUS_CHANGED",
      "Admin Management",
      "SUCCESS",
      `Set admin ${updated.name} status to ${data.status}`,
      data.id,
    );

    return { ok: true as const };
  });

export const adminUpdateAdminPermissions = createServerFn({ method: "POST" })
  .validator((data: { id: string; role: string; permissions: PermissionName[] }) => ({
    id: String(data?.id ?? ""),
    role: String(data?.role ?? "Custom"),
    permissions: Array.isArray(data?.permissions) ? (data.permissions as PermissionName[]) : [],
  }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("ADMIN_EDIT");

    const updated = cmsStore.updateAdmin(data.id, {
      role: data.role,
      permissions: data.permissions,
    });
    if (!updated) throw new Error("Admin user not found.");

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "ADMIN_PERMISSIONS_UPDATED",
      "Admin Management",
      "SUCCESS",
      `Updated permissions for admin ${updated.name}`,
      data.id,
    );

    return { ok: true as const };
  });

export const adminDeleteAdmin = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data }) => {
    const { requirePermission } = await import("./admin.server");
    const session = await requirePermission("ADMIN_DELETE");

    const success = cmsStore.deleteAdmin(data.id);

    cmsStore.logAudit(
      session.data.adminId || "admin",
      session.data.adminName || "Admin",
      "ADMIN_DELETED",
      "Admin Management",
      "SUCCESS",
      `Deleted admin user ID ${data.id}`,
      data.id,
    );

    return { ok: success };
  });

/* -------------------------------------------------------------- AUDIT LOGS CMS */

export const adminListAuditLogs = createServerFn({ method: "GET" }).handler(async () => {
  const { requirePermission } = await import("./admin.server");
  await requirePermission("AUDIT_LOG_VIEW");
  return cmsStore.getAuditLogs();
});

/* ------------------------------------------------------------ PUBLIC DATA API */

export const publicGetHomeData = createServerFn({ method: "GET" }).handler(async () => {
  let introduction = cmsStore.getIntroduction();
  let beforeAfter = cmsStore.getBeforeAfterProjects().filter((p) => p.is_published);
  let shortVideos = cmsStore.getVideos("short").filter((v) => v.is_published);
  let longVideos = cmsStore.getVideos("long").filter((v) => v.is_published);
  let settings = cmsStore.getSettings();

  try {
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");

    // Check site_settings table
    const { data: sRows } = await supabaseAdmin.from("site_settings").select("key, value");
    if (sRows && sRows.length > 0) {
      settings = {
        ...settings,
        ...Object.fromEntries(sRows.map((r: { key: string; value: string }) => [r.key, r.value])),
      };

      if (settings["introduction_data"]) {
        try {
          const dbIntro = JSON.parse(settings["introduction_data"]);
          introduction = {
            ...introduction,
            ...dbIntro,
          };
        } catch (e) {
          // ignore parsing error
        }
      }

      if (settings["before_after_data"]) {
        try {
          const baData = JSON.parse(settings["before_after_data"]);
          if (Array.isArray(baData)) {
            beforeAfter = baData.filter((p) => p.is_published);
          }
        } catch (e) {
          // ignore
        }
      }

      if (settings["videos_data"]) {
        try {
          const vData = JSON.parse(settings["videos_data"]);
          if (Array.isArray(vData)) {
            shortVideos = vData.filter((v: AdminVideo) => v.kind === "short" && v.is_published);
            longVideos = vData.filter((v: AdminVideo) => v.kind === "long" && v.is_published);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // Fallback to cmsStore
  }

  return {
    introduction,
    beforeAfter,
    shortVideos,
    longVideos,
    settings,
  };
});
