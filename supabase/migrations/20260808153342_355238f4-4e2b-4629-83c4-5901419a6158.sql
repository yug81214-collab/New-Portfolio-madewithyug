REVOKE ALL ON FUNCTION public.grant_owner_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "Anyone can view published videos" ON public.videos;
CREATE POLICY "Anyone can view published videos" ON public.videos FOR SELECT TO anon, authenticated USING (is_published);