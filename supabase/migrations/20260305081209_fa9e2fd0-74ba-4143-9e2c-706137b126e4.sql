CREATE TABLE IF NOT EXISTS public.persistence_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  full_name_encrypted TEXT,
  document_id_encrypted TEXT,
  document_type TEXT,
  front_image_encrypted TEXT,
  back_image_encrypted TEXT,
  selfie_image_encrypted TEXT,
  verification_status TEXT NOT NULL DEFAULT 'email_pending',
  verified BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT persistence_verifications_status_check CHECK (verification_status IN ('email_pending', 'identity_pending', 'pending', 'approved', 'rejected')),
  CONSTRAINT persistence_verifications_document_type_check CHECK (document_type IS NULL OR document_type IN ('cpf', 'rg'))
);

ALTER TABLE public.persistence_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own persistence verification"
ON public.persistence_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own persistence verification"
ON public.persistence_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pending persistence verification"
ON public.persistence_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage persistence verifications"
ON public.persistence_verifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_persistence_verifications_user_id
ON public.persistence_verifications (user_id);

CREATE INDEX IF NOT EXISTS idx_persistence_verifications_status
ON public.persistence_verifications (verification_status);

CREATE TRIGGER update_persistence_verifications_updated_at
BEFORE UPDATE ON public.persistence_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();