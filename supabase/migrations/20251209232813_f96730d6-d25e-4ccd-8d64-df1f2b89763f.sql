-- Create houses table for premium property listings
CREATE TABLE public.houses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement public.settlement_type NOT NULL,
  title TEXT NOT NULL,
  price_rub NUMERIC NOT NULL,
  house_area_sqm NUMERIC NOT NULL,
  land_area_sqm NUMERIC NOT NULL,
  rooms INTEGER NOT NULL DEFAULT 4,
  floors INTEGER NOT NULL DEFAULT 2,
  house_class TEXT NOT NULL DEFAULT 'premium', -- 'comfort', 'business', 'premium'
  short_description TEXT,
  full_description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  advantages JSONB DEFAULT '[]'::jsonb,
  infrastructure JSONB DEFAULT '[]'::jsonb,
  latitude NUMERIC,
  longitude NUMERIC,
  status public.plot_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

-- Houses are visible to everyone (public listing)
CREATE POLICY "Houses are visible to everyone"
ON public.houses
FOR SELECT
USING (true);

-- Only admins and chairmen can manage houses
CREATE POLICY "Admins and chairmen can manage houses"
ON public.houses
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.user_role) OR 
  public.has_role(auth.uid(), 'chairman_zapovednoe'::public.user_role) OR 
  public.has_role(auth.uid(), 'chairman_kolosok'::public.user_role)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, house_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can see their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add to favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their favorites
CREATE POLICY "Users can remove from favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create viewing requests table
CREATE TABLE public.viewing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID REFERENCES public.houses(id) ON DELETE SET NULL,
  settlement public.settlement_type NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create viewing requests
CREATE POLICY "Anyone can create viewing requests"
ON public.viewing_requests
FOR INSERT
WITH CHECK (true);

-- Admins can view and manage requests
CREATE POLICY "Admins can manage viewing requests"
ON public.viewing_requests
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.user_role) OR 
  public.has_role(auth.uid(), 'chairman_zapovednoe'::public.user_role) OR 
  public.has_role(auth.uid(), 'chairman_kolosok'::public.user_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_houses_updated_at
BEFORE UPDATE ON public.houses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_viewing_requests_updated_at
BEFORE UPDATE ON public.viewing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();