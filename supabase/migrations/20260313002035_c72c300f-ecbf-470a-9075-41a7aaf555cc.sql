DROP VIEW IF EXISTS public.establishments_public;

ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE VIEW public.establishments_public AS
SELECT id, name, description, category, city, state_abbr, sub_location, photo_url, address, avg_rating, total_votes, is_vip, created_at, updated_at, latitude, longitude
FROM public.establishments;