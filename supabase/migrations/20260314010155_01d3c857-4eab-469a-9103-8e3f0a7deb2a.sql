-- Function to delete all user data (LGPD compliance)
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security: only the user themselves can delete their data
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot delete another user''s data';
  END IF;

  -- Delete from all user-related tables
  DELETE FROM public.user_persistencia WHERE user_id = p_user_id;
  DELETE FROM public.persistence_verifications WHERE user_id = p_user_id;
  DELETE FROM public.student_persistence WHERE user_id = p_user_id;
  DELETE FROM public.anonymous_profiles WHERE user_id = p_user_id;
  DELETE FROM public.user_profiles WHERE user_id = p_user_id;
  DELETE FROM public.sulcoins_log WHERE user_id = p_user_id;
  DELETE FROM public.sulcoins WHERE user_id = p_user_id;
  DELETE FROM public.transfers WHERE de_id = p_user_id OR para_id = p_user_id;
  DELETE FROM public.avaliacoes WHERE user_id = p_user_id;
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
END;
$$;