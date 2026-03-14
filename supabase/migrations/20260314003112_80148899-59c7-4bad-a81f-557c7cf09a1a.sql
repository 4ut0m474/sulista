CREATE TABLE IF NOT EXISTS public.user_persistencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_hash text NOT NULL,
  documento_hash text NOT NULL,
  telefone_hash text,
  termos_aceitos boolean NOT NULL DEFAULT false,
  privacidade_aceita boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_persistencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own persistencia"
  ON public.user_persistencia FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own persistencia"
  ON public.user_persistencia FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all persistencia"
  ON public.user_persistencia FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));