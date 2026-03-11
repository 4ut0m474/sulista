
-- 1. Attach the existing trigger function for avaliacoes
CREATE TRIGGER on_avaliacao_change
  AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_establishment_rating_from_avaliacoes();

-- 2. Create function to give 50 SulCoins on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_sulcoins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sulcoins (user_id, saldo, atualizado_em)
  VALUES (NEW.id, 50, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.sulcoins_log (user_id, tipo, valor, descricao)
  VALUES (NEW.id, 'signup_bonus', 50, 'Bônus de boas-vindas: 50 SulCoins');
  
  RETURN NEW;
END;
$$;

-- 3. Attach signup bonus trigger to auth.users
CREATE TRIGGER on_auth_user_created_sulcoins
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_sulcoins();
