CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('short','long')),
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  length_label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon;
GRANT SELECT ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published videos" ON public.videos FOR SELECT TO anon, authenticated USING (is_published);
CREATE TRIGGER videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  video_type text NOT NULL DEFAULT '',
  reference text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.submissions TO anon;
GRANT INSERT ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a brief" ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'Yug Jha'),
  ('logo_url', ''),
  ('hero_badge', 'Available for new projects'),
  ('hero_title', 'VSLs That Keep People'),
  ('hero_title_highlight', 'Watching & Buying.'),
  ('hero_subtitle', 'I''m Yug — a VSL editor and motion graphics artist. I turn scripts and raw footage into video sales letters that hold attention, answer objections and close.'),
  ('short_form_title', 'Explore my short-form & VSL edits'),
  ('short_form_subtitle', 'Vertical edits built for one job only: keep the viewer watching until the offer lands.'),
  ('long_form_title', 'Long form & documentary work'),
  ('contact_title', 'Let''s make your next video the one people finish.'),
  ('contact_subtitle', 'Tell me about the project. I reply within 24 hours with a plan, a price and a timeline.'),
  ('contact_email', 'yjha019@gmail.com');