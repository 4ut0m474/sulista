
CREATE OR REPLACE FUNCTION public.transfer_sulcoins(p_from_user uuid, p_to_user uuid, p_amount integer, p_reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transfer_id UUID;
  v_sender_balance INTEGER;
BEGIN
  -- SECURITY: Ensure caller can only transfer from their own account
  IF p_from_user <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot transfer from another user''s account';
  END IF;

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
$function$;
