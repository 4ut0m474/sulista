
-- 1. Fix SECURITY DEFINER view: recreate establishments_public as a regular view
DROP VIEW IF EXISTS public.establishments_public;
CREATE VIEW public.establishments_public
WITH (security_invoker = true)
AS
SELECT id, name, description, category, city, state_abbr, sub_location, photo_url, address, avg_rating, total_votes, is_vip, created_at, updated_at
FROM public.establishments;

-- 2. Restrict admin_config: remove public SELECT, add admin-only SELECT
DROP POLICY IF EXISTS "Admin config is publicly readable" ON public.admin_config;
CREATE POLICY "Only admins can read admin config"
ON public.admin_config
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict votes table further: ensure only admins can read
-- (policy already exists, but let's make sure)
DROP POLICY IF EXISTS "Only admins can read votes" ON public.votes;
CREATE POLICY "Only admins can read votes"
ON public.votes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
