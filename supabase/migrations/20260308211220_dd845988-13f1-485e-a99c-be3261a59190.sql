
-- Table for city images (background + carousel)
CREATE TABLE public.cidade_imagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_abbr text NOT NULL,
  cidade text NOT NULL,
  url_fundo text NOT NULL,
  url_carrossel1 text,
  url_carrossel2 text,
  url_carrossel3 text,
  url_carrossel4 text,
  url_carrossel5 text,
  filtro_cor text DEFAULT 'primary',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(state_abbr, cidade)
);

-- Enable RLS
ALTER TABLE public.cidade_imagens ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read city images"
  ON public.cidade_imagens FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage city images"
  ON public.cidade_imagens FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
