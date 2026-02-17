
-- Create a public view that excludes phone numbers
CREATE OR REPLACE VIEW public.establishments_public AS
SELECT id, name, description, category, city, state_abbr, sub_location, photo_url, address, avg_rating, total_votes, is_vip, created_at, updated_at
FROM public.establishments;

-- Drop the existing permissive public SELECT policy
DROP POLICY IF EXISTS "Establishments are publicly readable" ON public.establishments;

-- Create new policy: only admins can SELECT directly from the table
CREATE POLICY "Only admins can read establishments directly"
ON public.establishments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
