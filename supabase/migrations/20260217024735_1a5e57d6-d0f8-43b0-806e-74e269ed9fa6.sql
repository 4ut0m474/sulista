
-- Table for global admin config (whatsapp, email, etc.)
CREATE TABLE public.admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin config is publicly readable"
ON public.admin_config FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert admin config"
ON public.admin_config FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update admin config"
ON public.admin_config FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete admin config"
ON public.admin_config FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Table for city-specific admin content (stalls, carousel, promotions, events, etc.)
CREATE TABLE public.admin_city_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_abbr text NOT NULL,
  city text NOT NULL,
  section text NOT NULL,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(state_abbr, city, section)
);

ALTER TABLE public.admin_city_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "City content is publicly readable"
ON public.admin_city_content FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert city content"
ON public.admin_city_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update city content"
ON public.admin_city_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete city content"
ON public.admin_city_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Table for admin notifications
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  city text,
  state_abbr text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read notifications"
ON public.admin_notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert notifications"
ON public.admin_notifications FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update notifications"
ON public.admin_notifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete notifications"
ON public.admin_notifications FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_admin_config_updated_at
BEFORE UPDATE ON public.admin_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_city_content_updated_at
BEFORE UPDATE ON public.admin_city_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
