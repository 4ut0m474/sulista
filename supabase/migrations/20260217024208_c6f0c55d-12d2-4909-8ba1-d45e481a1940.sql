
-- Drop the current permissive SELECT policy on votes
DROP POLICY IF EXISTS "Votes are publicly readable" ON public.votes;

-- Only admins can read votes (including device_fingerprint)
CREATE POLICY "Only admins can read votes"
ON public.votes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
