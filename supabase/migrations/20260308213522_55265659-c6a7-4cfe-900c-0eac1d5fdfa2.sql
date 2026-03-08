
-- Create avaliacoes table
CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id uuid NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nota integer NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, comercio_id)
);

-- Enable RLS
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert their own vote
CREATE POLICY "Users can insert own vote"
ON public.avaliacoes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Public can read all votes (for rankings)
CREATE POLICY "Public can read avaliacoes"
ON public.avaliacoes FOR SELECT
USING (true);

-- Users can update their own vote
CREATE POLICY "Users can update own vote"
ON public.avaliacoes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update establishment avg_rating and total_votes from avaliacoes
CREATE OR REPLACE FUNCTION public.update_establishment_rating_from_avaliacoes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.establishments
  SET 
    avg_rating = (SELECT ROUND(AVG(nota)::numeric, 1) FROM public.avaliacoes WHERE comercio_id = COALESCE(NEW.comercio_id, OLD.comercio_id)),
    total_votes = (SELECT COUNT(*) FROM public.avaliacoes WHERE comercio_id = COALESCE(NEW.comercio_id, OLD.comercio_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.comercio_id, OLD.comercio_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_rating_avaliacoes
AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.update_establishment_rating_from_avaliacoes();
