import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./supabase";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    // Public server functions work without a browser Supabase session.
    // Skip optional auth wiring when these client credentials are absent.
    if (!url || !key) return next();

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return next({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.warn("[Supabase] Auth session lookup skipped:", error);
      return next();
    }
  },
);
