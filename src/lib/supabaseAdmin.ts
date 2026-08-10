import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

/**
 * Service-role client. Server-only.
 * Built lazily on first use because env vars are injected at request time,
 * not at module-evaluation time.
 */
let client: SupabaseClient<Database> | null = null;

function build(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!url || !key) {
    console.warn("Backend credentials missing for admin client.");
  }

  const customAdminFetch: typeof fetch = (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, k) => headers.set(k, value));
    }

    const authHeader = headers.get("Authorization");
    if (authHeader === `Bearer ${key}` && !key.startsWith("eyJ")) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);

    return fetch(input, { ...init, headers });
  };

  return createClient<Database>(url, key, {
    global: { fetch: customAdminFetch },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!client) client = build();
  return client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const value = getSupabaseAdmin()[prop as keyof SupabaseClient<Database>];
    return typeof value === "function" ? value.bind(getSupabaseAdmin()) : value;
  },
});
