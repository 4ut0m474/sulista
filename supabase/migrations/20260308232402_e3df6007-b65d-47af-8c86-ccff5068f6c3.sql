
-- Create planos_cidade table
CREATE TABLE public.planos_cidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_abbr text NOT NULL,
  city text NOT NULL,
  plano_nome text NOT NULL,
  preco decimal(10,2) NOT NULL,
  beneficios text[] DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one plan name per city
ALTER TABLE public.planos_cidade ADD CONSTRAINT planos_cidade_unique UNIQUE (state_abbr, city, plano_nome);

-- RLS
ALTER TABLE public.planos_cidade ENABLE ROW LEVEL SECURITY;

-- Public read for active plans
CREATE POLICY "Public can read active plans"
  ON public.planos_cidade FOR SELECT
  USING (ativo = true);

-- Admin full access
CREATE POLICY "Admins can manage all plans"
  ON public.planos_cidade FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
