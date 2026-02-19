
-- Tabela de saldo SulCoins
CREATE TABLE public.sulcoins (
  user_id UUID PRIMARY KEY,
  saldo INTEGER NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sulcoins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sulcoins"
  ON public.sulcoins FOR SELECT
  USING (user_id::text = coalesce(auth.uid()::text, ''));

CREATE POLICY "Users can insert own sulcoins"
  ON public.sulcoins FOR INSERT
  WITH CHECK (user_id::text = coalesce(auth.uid()::text, ''));

CREATE POLICY "Users can update own sulcoins"
  ON public.sulcoins FOR UPDATE
  USING (user_id::text = coalesce(auth.uid()::text, ''));

-- Tabela de transferências
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  de_id UUID NOT NULL,
  para_id UUID NOT NULL,
  valor INTEGER NOT NULL CHECK (valor > 0),
  confirmada BOOLEAN NOT NULL DEFAULT false,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON public.transfers FOR SELECT
  USING (de_id::text = coalesce(auth.uid()::text, '') OR para_id::text = coalesce(auth.uid()::text, ''));

CREATE POLICY "Users can create transfers"
  ON public.transfers FOR INSERT
  WITH CHECK (de_id::text = coalesce(auth.uid()::text, ''));

CREATE POLICY "Admins can view all transfers"
  ON public.transfers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Tabela de log de ganhos
CREATE TABLE public.sulcoins_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  valor INTEGER NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sulcoins_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.sulcoins_log FOR SELECT
  USING (user_id::text = coalesce(auth.uid()::text, ''));

CREATE POLICY "System can insert logs"
  ON public.sulcoins_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
  ON public.sulcoins_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger para atualizar timestamp
CREATE TRIGGER update_sulcoins_updated_at
  BEFORE UPDATE ON public.sulcoins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
