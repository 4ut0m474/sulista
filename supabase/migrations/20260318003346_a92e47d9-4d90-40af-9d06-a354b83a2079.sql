
-- Table: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  uid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf_hash text NOT NULL,
  telefone text,
  aceitou_termos boolean NOT NULL DEFAULT false,
  aceitou_privacidade boolean NOT NULL DEFAULT false,
  confirmado_email boolean NOT NULL DEFAULT false,
  data_criacao timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usuario" ON public.usuarios
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read own usuario" ON public.usuarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own usuario" ON public.usuarios
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete own usuario" ON public.usuarios
  FOR DELETE TO authenticated USING (true);

-- Table: pins
CREATE TABLE IF NOT EXISTS public.pins (
  id serial PRIMARY KEY,
  uid uuid REFERENCES public.usuarios(uid) ON DELETE CASCADE NOT NULL,
  pin text NOT NULL,
  expira timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert pins" ON public.pins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can read pins" ON public.pins
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can delete pins" ON public.pins
  FOR DELETE TO authenticated USING (true);
