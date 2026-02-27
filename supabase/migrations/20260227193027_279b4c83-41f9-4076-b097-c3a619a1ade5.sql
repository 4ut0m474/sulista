
-- Table for anonymous persistent profiles with hashed PIN
CREATE TABLE public.anonymous_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own anonymous profile"
ON public.anonymous_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own anonymous profile"
ON public.anonymous_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own anonymous profile"
ON public.anonymous_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all anonymous profiles"
ON public.anonymous_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_anonymous_profiles_updated_at
BEFORE UPDATE ON public.anonymous_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
