
-- Aurora RPG Progress table
CREATE TABLE public.aurora_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  classe TEXT NOT NULL DEFAULT 'aprendiz',
  pontos INTEGER NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 1,
  streaks_diarios INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] DEFAULT '{}'::TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.aurora_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON public.aurora_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.aurora_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.aurora_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all progress" ON public.aurora_progress FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_aurora_progress_updated_at BEFORE UPDATE ON public.aurora_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Aurora Quests table
CREATE TABLE public.aurora_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'individual',
  status TEXT NOT NULL DEFAULT 'ativa',
  pontos_recompensa INTEGER NOT NULL DEFAULT 50,
  voucher_valor NUMERIC DEFAULT 0,
  prova_url TEXT,
  confirmacoes INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aurora_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quests" ON public.aurora_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON public.aurora_quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.aurora_quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all quests" ON public.aurora_quests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_aurora_quests_updated_at BEFORE UPDATE ON public.aurora_quests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily habits log
CREATE TABLE public.aurora_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL,
  descricao TEXT,
  pontos INTEGER NOT NULL DEFAULT 0,
  prova_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, data, tipo)
);

ALTER TABLE public.aurora_diario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diario" ON public.aurora_diario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diario" ON public.aurora_diario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all diario" ON public.aurora_diario FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
