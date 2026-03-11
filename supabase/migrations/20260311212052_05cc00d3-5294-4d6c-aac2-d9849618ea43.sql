
-- Table: localidades
-- Stores states, cities, and sub-locations (praias, bairros) in a single flat table
CREATE TABLE IF NOT EXISTS public.localidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_abbr text NOT NULL,
  state_name text NOT NULL,
  city text,
  type text NOT NULL DEFAULT 'estado', -- 'estado', 'cidade', 'praia', 'bairro'
  name text NOT NULL,
  district text,
  description text,
  image_url text,
  highlights text[] DEFAULT '{}',
  group_label text, -- e.g. "Praias", "Bairros Turísticos"
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_localidades_unique 
  ON public.localidades (state_abbr, COALESCE(city, ''), type, name);

-- Enable RLS
ALTER TABLE public.localidades ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read localidades"
  ON public.localidades FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin management
CREATE POLICY "Admins can manage localidades"
  ON public.localidades FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
