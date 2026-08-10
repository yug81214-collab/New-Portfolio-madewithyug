import { createClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined"
    ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    : undefined) ||
  "";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined"
    ? process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
    : undefined) ||
  "";

if (!import.meta.env.VITE_SUPABASE_URL && typeof console !== "undefined") {
  console.warn("VITE_SUPABASE_URL environment variable is missing. Using default fallback URL.");
}

// Ensure the publishable key isn't sent as a Bearer token if it's not a JWT
const customFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }

  const authHeader = headers.get("Authorization");
  if (authHeader === `Bearer ${supabaseKey}` && !supabaseKey?.startsWith("eyJ")) {
    headers.delete("Authorization");
  }

  headers.set("apikey", supabaseKey);

  return fetch(input, { ...init, headers });
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
