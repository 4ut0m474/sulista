
-- Create agent_personas table
CREATE TABLE public.agent_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name text NOT NULL UNIQUE,
  protocol_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_personas ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read agent personas"
ON public.agent_personas
FOR SELECT
TO public
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage agent personas"
ON public.agent_personas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_agent_personas_updated_at
BEFORE UPDATE ON public.agent_personas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
