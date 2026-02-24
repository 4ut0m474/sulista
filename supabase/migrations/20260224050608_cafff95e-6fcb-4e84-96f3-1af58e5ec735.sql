
-- Fix 1: Restrict admin_city_content - hide stalls section from public (contains merchant secret codes)
DROP POLICY IF EXISTS "City content is publicly readable" ON public.admin_city_content;

-- Public can read non-stalls sections
CREATE POLICY "Public can read non-sensitive city content"
  ON public.admin_city_content FOR SELECT
  USING (section != 'stalls');

-- Admins can read everything including stalls
CREATE POLICY "Admins can read all city content"
  ON public.admin_city_content FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Create atomic transfer function for SulCoins
CREATE OR REPLACE FUNCTION public.transfer_sulcoins(
  p_from_user UUID,
  p_to_user UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transfer_id UUID;
  v_sender_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF p_from_user = p_to_user THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  -- Lock sender row
  SELECT saldo INTO v_sender_balance
  FROM sulcoins
  WHERE user_id = p_from_user
  FOR UPDATE;

  IF v_sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender account not found';
  END IF;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Debit sender
  UPDATE sulcoins SET saldo = saldo - p_amount, atualizado_em = now()
  WHERE user_id = p_from_user;

  -- Credit recipient (create if not exists)
  INSERT INTO sulcoins (user_id, saldo, atualizado_em)
  VALUES (p_to_user, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE SET saldo = sulcoins.saldo + p_amount, atualizado_em = now();

  -- Create transfer record
  INSERT INTO transfers (de_id, para_id, valor, confirmada, motivo)
  VALUES (p_from_user, p_to_user, p_amount, true, p_reason)
  RETURNING id INTO v_transfer_id;

  -- Log both sides
  INSERT INTO sulcoins_log (user_id, tipo, valor, descricao)
  VALUES
    (p_from_user, 'transfer_out', -p_amount, COALESCE(p_reason, 'Transferência enviada')),
    (p_to_user, 'transfer_in', p_amount, COALESCE(p_reason, 'Transferência recebida'));

  RETURN v_transfer_id;
END;
$$;

-- Fix 3: Add rate limiting for votes - max 3 votes per device per establishment per day
DROP POLICY IF EXISTS "Anyone can vote" ON public.votes;

CREATE POLICY "Rate limited voting"
  ON public.votes FOR INSERT
  WITH CHECK (
    (SELECT COUNT(*) FROM public.votes v
     WHERE v.device_fingerprint = votes.device_fingerprint
       AND v.establishment_id = votes.establishment_id
       AND v.created_at > (now() - interval '1 day')
    ) < 3
  );
