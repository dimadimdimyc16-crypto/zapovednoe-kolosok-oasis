-- Add garage column to houses table
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS has_garage boolean DEFAULT false;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS garage_spaces integer DEFAULT 0;

-- Create viewed_houses table for tracking house views
CREATE TABLE IF NOT EXISTS public.viewed_houses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  house_id uuid NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, house_id)
);

-- Enable RLS
ALTER TABLE public.viewed_houses ENABLE ROW LEVEL SECURITY;

-- RLS policies for viewed_houses
CREATE POLICY "Users can view their own viewed houses"
ON public.viewed_houses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add viewed houses"
ON public.viewed_houses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their viewed houses"
ON public.viewed_houses FOR DELETE
USING (auth.uid() = user_id);

-- Update houses with garage data
UPDATE public.houses SET has_garage = true, garage_spaces = 2 WHERE house_class = 'premium';
UPDATE public.houses SET has_garage = true, garage_spaces = 3 WHERE house_class = 'luxury';
UPDATE public.houses SET has_garage = true, garage_spaces = 1 WHERE house_class = 'comfort';