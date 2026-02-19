
-- Corrigir política permissiva do sulcoins_log: só authenticated pode inserir
DROP POLICY "System can insert logs" ON public.sulcoins_log;

CREATE POLICY "Authenticated can insert logs"
  ON public.sulcoins_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
