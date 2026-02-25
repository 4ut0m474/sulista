
-- Replace blacklist RLS policy with whitelist for admin_city_content
DROP POLICY IF EXISTS "Public can read non-sensitive city content" ON public.admin_city_content;

CREATE POLICY "Public can read approved sections"
ON public.admin_city_content
FOR SELECT
USING (section IN ('carousel', 'events', 'attractions', 'dining', 'commerce', 'promotions', 'trails', 'treasure_hunt', 'group_buy'));
