import { MEDIA } from "./portfolio-assets";
// No node:crypto import

export type PermissionName =
  | "CONTENT_VIEW"
  | "CONTENT_CREATE"
  | "CONTENT_EDIT"
  | "CONTENT_DELETE"
  | "VIDEO_VIEW"
  | "VIDEO_CREATE"
  | "VIDEO_EDIT"
  | "VIDEO_DELETE"
  | "INTRODUCTION_VIEW"
  | "INTRODUCTION_EDIT"
  | "BEFORE_AFTER_VIEW"
  | "BEFORE_AFTER_CREATE"
  | "BEFORE_AFTER_EDIT"
  | "BEFORE_AFTER_DELETE"
  | "CLIENT_FORM_VIEW"
  | "CLIENT_FORM_EXPORT"
  | "CLIENT_FORM_DELETE"
  | "MEDIA_VIEW"
  | "MEDIA_UPLOAD"
  | "MEDIA_DELETE"
  | "SETTINGS_VIEW"
  | "SETTINGS_EDIT"
  | "ADMIN_VIEW"
  | "ADMIN_INVITE"
  | "ADMIN_EDIT"
  | "ADMIN_DISABLE"
  | "ADMIN_DELETE"
  | "AUDIT_LOG_VIEW";

export const ALL_PERMISSIONS: PermissionName[] = [
  "CONTENT_VIEW",
  "CONTENT_CREATE",
  "CONTENT_EDIT",
  "CONTENT_DELETE",
  "VIDEO_VIEW",
  "VIDEO_CREATE",
  "VIDEO_EDIT",
  "VIDEO_DELETE",
  "INTRODUCTION_VIEW",
  "INTRODUCTION_EDIT",
  "BEFORE_AFTER_VIEW",
  "BEFORE_AFTER_CREATE",
  "BEFORE_AFTER_EDIT",
  "BEFORE_AFTER_DELETE",
  "CLIENT_FORM_VIEW",
  "CLIENT_FORM_EXPORT",
  "CLIENT_FORM_DELETE",
  "MEDIA_VIEW",
  "MEDIA_UPLOAD",
  "MEDIA_DELETE",
  "SETTINGS_VIEW",
  "SETTINGS_EDIT",
  "ADMIN_VIEW",
  "ADMIN_INVITE",
  "ADMIN_EDIT",
  "ADMIN_DISABLE",
  "ADMIN_DELETE",
  "AUDIT_LOG_VIEW",
];

export const PERMISSION_GROUPS: Record<string, PermissionName[]> = {
  "Full Admin": ALL_PERMISSIONS,
  "Content Manager": [
    "CONTENT_VIEW",
    "CONTENT_CREATE",
    "CONTENT_EDIT",
    "CONTENT_DELETE",
    "INTRODUCTION_VIEW",
    "INTRODUCTION_EDIT",
    "SETTINGS_VIEW",
  ],
  "Video Manager": [
    "VIDEO_VIEW",
    "VIDEO_CREATE",
    "VIDEO_EDIT",
    "VIDEO_DELETE",
    "MEDIA_VIEW",
    "MEDIA_UPLOAD",
  ],
  "Lead Manager": ["CLIENT_FORM_VIEW", "CLIENT_FORM_EXPORT", "CLIENT_FORM_DELETE"],
  "Media Manager": ["MEDIA_VIEW", "MEDIA_UPLOAD", "MEDIA_DELETE"],
  "Website Manager": [
    "CONTENT_VIEW",
    "CONTENT_EDIT",
    "VIDEO_VIEW",
    "VIDEO_EDIT",
    "BEFORE_AFTER_VIEW",
    "BEFORE_AFTER_EDIT",
    "INTRODUCTION_VIEW",
    "INTRODUCTION_EDIT",
    "SETTINGS_VIEW",
    "SETTINGS_EDIT",
  ],
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_owner: boolean;
  status: "active" | "disabled";
  permissions: PermissionName[];
  created_at: string;
  last_login?: string;
  access_key_hash?: string;
};

export type AdminInvitation = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: PermissionName[];
  invite_code: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
  created_by: string;
};

export type IntroductionContent = {
  id: string;
  main_heading: string;
  subheading: string;
  intro_body: string;
  additional_paragraphs: string[];
  short_description: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  image_alt: string;
  image_position: string;
  badge_text: string;
  stats: Array<{ label: string; value: string }>;
  skills: string[];
  is_visible: boolean;
  updated_at: string;
  updated_by?: string;
};

export type BeforeAfterProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  before_image: string;
  after_image: string;
  client: string;
  project_date: string;
  before_retention: string;
  after_retention: string;
  notes: string[];
  featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ClientSubmissionStatus =
  "NEW" | "CONTACTED" | "IN_PROGRESS" | "QUALIFIED" | "CONVERTED" | "CLOSED" | "SPAM";

export type ClientSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  video_type?: string;
  deadline?: string;
  budget?: string;
  reference?: string;
  description: string;
  status: ClientSubmissionStatus;
  internal_notes?: string;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  url: string;
  storage_path: string;
  category: "image" | "video" | "thumbnail" | "other";
  usage_count: number;
  uploaded_by: string;
  created_at: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  admin_id: string;
  admin_name: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip?: string;
  result: "SUCCESS" | "FAILURE" | "DENIED";
  details?: string;
};

// Initial default database state
const defaultAdmins: AdminUser[] = [
  {
    id: "owner-1",
    name: "Yug Jha (Owner)",
    email: "jhayug29@gmail.com",
    role: "owner",
    is_owner: true,
    status: "active",
    permissions: ALL_PERMISSIONS,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
];

const defaultInvitations: AdminInvitation[] = [];

const defaultIntroduction: IntroductionContent = {
  id: "intro-main",
  main_heading: "About Me",
  subheading: "VSL Video Editor & Motion Graphics Artist",
  intro_body:
    "I'm Yug Jha — a VSL specialist and motion graphics editor focused on building high-converting video assets for brands, agencies, and creators. Over the past 2+ years, I've cut over 200 videos generating millions of impressions and high sales retention.",
  additional_paragraphs: [
    "Every frame is engineered around viewer psychology — eliminating drop-off points, reinforcing core value propositions, and driving clear action.",
    "Specialized in VSL editing, kinetic text animations, sound design, color grading, and retention-oriented short-form content.",
  ],
  short_description: "Crafting retention-driven sales letters and motion graphics.",
  cta_text: "Let's Build Your Next VSL",
  cta_link: "#contact",
  image_url: MEDIA.intro,
  image_alt: "Yug Jha portrait",
  image_position: "center",
  badge_text: "Available for New Projects",
  stats: [
    { label: "Videos Edited", value: "200+" },
    { label: "Years Experience", value: "2+" },
    { label: "Delivery Speed", value: "24-48h" },
    { label: "Average Retention", value: "70%+" },
  ],
  skills: [
    "VSL Directing & Editing",
    "Motion Graphics & After Effects",
    "Kinetic Typography",
    "Sound Design & Audio Mixing",
    "Color Grading & Finishing",
    "Retention & Hook Strategy",
  ],
  is_visible: true,
  updated_at: new Date().toISOString(),
  updated_by: "Owner",
};

const defaultBeforeAfter: BeforeAfterProject[] = [
  {
    id: "ba-1",
    title: "High-Converting VSL Hook Transformation",
    category: "VSL / Hook Edit",
    description:
      "Transformation from unedited single-camera raw clip to retention-optimized VSL hook with punch-ins and sound design.",
    before_image: MEDIA.baRawVideo,
    after_image: MEDIA.baEditVideo,
    client: "Acme Media Group",
    project_date: "2026-01-15",
    before_retention: "18% retention",
    after_retention: "71% retention",
    notes: [
      "Cut the first 3 seconds of dead air — the hook now starts on frame one.",
      "Added kinetic captions timed to the speaker's stressed syllables.",
      "Punch-ins on every key claim so the frame never sits still.",
      "Sound design: whooshes on transitions, low-end bed under the promise.",
      "Cinematic grade with teal shadows to separate subject from background.",
      "Progress bar + curiosity text so viewers stay for the payoff.",
    ],
    featured: true,
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultSubmissions: ClientSubmission[] = [
  {
    id: "sub-demo-1",
    name: "Alex Rivera",
    company: "ScaleGrowth Agency",
    email: "alex@scalegrowth.io",
    phone: "+1 (555) 019-2834",
    video_type: "Long-form VSL (15-20 min)",
    deadline: "1-2 weeks",
    budget: "$1,500 - $3,000",
    reference: "https://youtube.com/watch?v=demo-ref",
    description:
      "We need a high-retention VSL cut for our new SaaS offer. Raw footage and script are ready.",
    status: "NEW",
    internal_notes: "High priority lead. Review script for hook placement.",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const defaultMedia: MediaAsset[] = [
  {
    id: "media-1",
    filename: "portrait.jpg",
    file_type: "image/jpeg",
    size_bytes: 245000,
    url: "/src/assets/portrait.jpg",
    storage_path: "portrait.jpg",
    category: "image",
    usage_count: 2,
    uploaded_by: "System",
    created_at: new Date().toISOString(),
  },
];

const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    admin_id: "owner-1",
    admin_name: "Owner",
    action: "SYSTEM_INITIALIZED",
    resource: "Admin CMS",
    result: "SUCCESS",
    details: "Initialized backend-controlled Admin CMS engine.",
  },
];

const defaultSettings: Record<string, string> = {
  site_title: "Yug Jha Portfolio",
  contact_email: "jhayug29@gmail.com",
};

const defaultVideos: Array<{
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
  created_at: string;
}> = [
  {
    id: "v-s1",
    kind: "short",
    title: "Retention Hook Transformation",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[0].poster,
    video_url: MEDIA.shorts[0].video,
    length_label: "",
    sort_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s2",
    kind: "short",
    title: "Scroll-Stopping Opening Frame",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[1].poster,
    video_url: MEDIA.shorts[1].video,
    length_label: "",
    sort_order: 2,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s3",
    kind: "short",
    title: "Kinetic Caption Cut",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[2].poster,
    video_url: MEDIA.shorts[2].video,
    length_label: "",
    sort_order: 3,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s4",
    kind: "short",
    title: "Objection-Handling Beat",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[3].poster,
    video_url: MEDIA.shorts[3].video,
    length_label: "",
    sort_order: 4,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s5",
    kind: "short",
    title: "Offer Reveal Edit",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[4].poster,
    video_url: MEDIA.shorts[4].video,
    length_label: "",
    sort_order: 5,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s6",
    kind: "short",
    title: "Fast-Paced Montage Cut",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[5].poster,
    video_url: MEDIA.shorts[5].video,
    length_label: "",
    sort_order: 6,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-s7",
    kind: "short",
    title: "Testimonial Punch-In Edit",
    category: "VSL Short",
    description: "Vertical short-form edit built to hold attention from frame one.",
    thumbnail_url: MEDIA.shorts[6].poster,
    video_url: MEDIA.shorts[6].video,
    length_label: "",
    sort_order: 7,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "v-l1",
    kind: "long",
    title: "Long Form Feature Edit",
    category: "VSL Long Form",
    description: "Full-length narrative edit with pacing, sound design and colour finishing.",
    thumbnail_url: MEDIA.long1Poster,
    video_url: MEDIA.long1Video,
    length_label: "",
    sort_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

// In-Memory Global State with Server Lifecycle Persistence
class CmsStore {
  private admins: AdminUser[] = [...defaultAdmins];
  private invitations: AdminInvitation[] = [...defaultInvitations];
  private introduction: IntroductionContent = { ...defaultIntroduction };
  private beforeAfter: BeforeAfterProject[] = [...defaultBeforeAfter];
  private submissions: ClientSubmission[] = [...defaultSubmissions];
  private media: MediaAsset[] = [...defaultMedia];
  private auditLogs: AuditLogEntry[] = [...defaultAuditLogs];
  private settings: Record<string, string> = { ...defaultSettings };
  private videos: Array<{
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
    created_at: string;
  }> = [...defaultVideos];

  // Helper for hashing secrets (Async)
  public async hashSecret(input: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Audit Logger
  public logAudit(
    adminId: string,
    adminName: string,
    action: string,
    resource: string,
    result: "SUCCESS" | "FAILURE" | "DENIED" = "SUCCESS",
    details?: string,
    resourceId?: string,
  ) {
    const entry: AuditLogEntry = {
      id: "log-" + crypto.randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
      admin_id: adminId,
      admin_name: adminName,
      action,
      resource,
      resource_id: resourceId,
      result,
      details,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
  }

  // Admins
  public getAdmins(): AdminUser[] {
    return this.admins;
  }

  public getAdminById(id: string): AdminUser | undefined {
    return this.admins.find((a) => a.id === id);
  }

  public findAdminByEmail(email: string): AdminUser | undefined {
    return this.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  public addAdmin(user: AdminUser) {
    this.admins.push(user);
  }

  public updateAdmin(id: string, patch: Partial<AdminUser>): AdminUser | undefined {
    const admin = this.getAdminById(id);
    if (!admin) return undefined;
    Object.assign(admin, patch);
    return admin;
  }

  public deleteAdmin(id: string): boolean {
    const idx = this.admins.findIndex((a) => a.id === id && !a.is_owner);
    if (idx !== -1) {
      this.admins.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Invitations
  public getInvitations(): AdminInvitation[] {
    return this.invitations;
  }

  public createInvitation(
    name: string,
    email: string,
    role: string,
    permissions: PermissionName[],
    createdBy: string,
  ): AdminInvitation {
    const code = "inv-" + crypto.randomUUID().slice(0, 12);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const inv: AdminInvitation = {
      id: "inv-id-" + crypto.randomUUID().slice(0, 8),
      name,
      email,
      role,
      permissions,
      invite_code: code,
      status: "pending",
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      created_by: createdBy,
    };
    this.invitations.unshift(inv);
    return inv;
  }

  public revokeInvitation(id: string): boolean {
    const inv = this.invitations.find((i) => i.id === id);
    if (inv && inv.status === "pending") {
      inv.status = "revoked";
      return true;
    }
    return false;
  }

  public async acceptInvitation(code: string, accessKey: string): Promise<AdminUser | undefined> {
    const inv = this.invitations.find((i) => i.invite_code === code && i.status === "pending");
    if (!inv) return undefined;
    if (new Date(inv.expires_at).getTime() < Date.now()) {
      inv.status = "expired";
      return undefined;
    }
    inv.status = "accepted";
    const newAdmin: AdminUser = {
      id: "admin-" + crypto.randomUUID().slice(0, 8),
      name: inv.name,
      email: inv.email,
      role: inv.role,
      is_owner: false,
      status: "active",
      permissions: inv.permissions,
      created_at: new Date().toISOString(),
      access_key_hash: await this.hashSecret(accessKey),
    };
    this.admins.push(newAdmin);
    return newAdmin;
  }

  // Introduction Content
  public getIntroduction(): IntroductionContent {
    return this.introduction;
  }

  public updateIntroduction(
    patch: Partial<IntroductionContent>,
    updatedBy: string,
  ): IntroductionContent {
    this.introduction = {
      ...this.introduction,
      ...patch,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    };
    return this.introduction;
  }

  // Before & After Projects
  public getBeforeAfterProjects(): BeforeAfterProject[] {
    return this.beforeAfter.sort((a, b) => a.sort_order - b.sort_order);
  }

  public addBeforeAfterProject(
    project: Omit<BeforeAfterProject, "id" | "created_at" | "updated_at">,
  ): BeforeAfterProject {
    const newProj: BeforeAfterProject = {
      ...project,
      id: "ba-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.beforeAfter.push(newProj);
    return newProj;
  }

  public updateBeforeAfterProject(
    id: string,
    patch: Partial<BeforeAfterProject>,
  ): BeforeAfterProject | undefined {
    const proj = this.beforeAfter.find((p) => p.id === id);
    if (!proj) return undefined;
    Object.assign(proj, { ...patch, updated_at: new Date().toISOString() });
    return proj;
  }

  public deleteBeforeAfterProject(id: string): boolean {
    const idx = this.beforeAfter.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.beforeAfter.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Client Submissions
  public getSubmissions(): ClientSubmission[] {
    return this.submissions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public addSubmission(
    data: Omit<ClientSubmission, "id" | "status" | "is_read" | "created_at" | "updated_at">,
  ): ClientSubmission {
    const sub: ClientSubmission = {
      ...data,
      id: "sub-" + crypto.randomUUID().slice(0, 8),
      status: "NEW",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.submissions.unshift(sub);
    return sub;
  }

  public updateSubmission(
    id: string,
    patch: Partial<ClientSubmission>,
  ): ClientSubmission | undefined {
    const sub = this.submissions.find((s) => s.id === id);
    if (!sub) return undefined;
    Object.assign(sub, { ...patch, updated_at: new Date().toISOString() });
    return sub;
  }

  public deleteSubmission(id: string): boolean {
    const idx = this.submissions.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.submissions.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Media Assets
  public getMediaAssets(): MediaAsset[] {
    return this.media.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  public addMediaAsset(asset: Omit<MediaAsset, "id" | "created_at">): MediaAsset {
    const m: MediaAsset = {
      ...asset,
      id: "media-" + crypto.randomUUID().slice(0, 8),
      created_at: new Date().toISOString(),
    };
    this.media.unshift(m);
    return m;
  }

  public deleteMediaAsset(id: string): boolean {
    const idx = this.media.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.media.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  // Settings
  public getSettings(): Record<string, string> {
    return this.settings;
  }

  public saveSettings(values: Record<string, string>): Record<string, string> {
    this.settings = { ...this.settings, ...values };
    return this.settings;
  }

  // Videos
  public getVideos(kind?: "short" | "long") {
    if (kind) {
      return this.videos.filter((v) => v.kind === kind);
    }
    return this.videos;
  }

  public createVideo(kind: "short" | "long", sortOrder = 0) {
    const v = {
      id: "v-" + crypto.randomUUID().slice(0, 8),
      kind,
      title: "New " + (kind === "short" ? "Short" : "Long") + " Video",
      category: kind === "short" ? "Short VSL" : "Long VSL",
      description: "",
      thumbnail_url: "",
      video_url: "",
      length_label: "0:00",
      sort_order: sortOrder,
      is_published: true,
      created_at: new Date().toISOString(),
    };
    this.videos.push(v);
    return v;
  }

  public saveVideo(id: string, patch: Partial<(typeof defaultVideos)[0]>) {
    const v = this.videos.find((item) => item.id === id);
    if (v) {
      Object.assign(v, patch);
    }
    return v;
  }

  public deleteVideo(id: string): boolean {
    const idx = this.videos.findIndex((item) => item.id === id);
    if (idx !== -1) {
      this.videos.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const cmsStore = new CmsStore();
