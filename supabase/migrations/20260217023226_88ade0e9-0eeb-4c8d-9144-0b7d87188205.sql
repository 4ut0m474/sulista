-- Add write protection policies to establishments table (admin-only)

CREATE POLICY "Only admins can create establishments"
ON public.establishments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update establishments"
ON public.establishments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete establishments"
ON public.establishments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));