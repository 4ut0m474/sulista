
CREATE TABLE public.student_persistence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name_encrypted text NOT NULL,
  birth_date_encrypted text NOT NULL,
  rg_responsavel_encrypted text NOT NULL,
  rg_photo_hash text,
  face_photo_hash text,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  rejection_reason text
);

ALTER TABLE public.student_persistence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own student persistence" ON public.student_persistence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own student persistence" ON public.student_persistence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage student persistence" ON public.student_persistence
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
