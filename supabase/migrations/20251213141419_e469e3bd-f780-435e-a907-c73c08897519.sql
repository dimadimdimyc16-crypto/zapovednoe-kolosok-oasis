-- Create page_settings table for homepage builder
CREATE TABLE IF NOT EXISTS public.page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text,
  meta_keywords text,
  content jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create homepage_blocks table for visual editor
CREATE TABLE IF NOT EXISTS public.homepage_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement settlement_type NOT NULL,
  block_type text NOT NULL,
  block_order integer NOT NULL DEFAULT 0,
  is_enabled boolean DEFAULT true,
  content jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_settings
CREATE POLICY "Public can view published pages" ON public.page_settings
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage pages" ON public.page_settings
FOR ALL USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'chairman_zapovednoe') OR 
  has_role(auth.uid(), 'chairman_kolosok')
);

-- RLS policies for homepage_blocks
CREATE POLICY "Public can view enabled blocks" ON public.homepage_blocks
FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage blocks" ON public.homepage_blocks
FOR ALL USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'chairman_zapovednoe') OR 
  has_role(auth.uid(), 'chairman_kolosok')
);

-- Add triggers for updated_at
CREATE TRIGGER update_page_settings_updated_at
BEFORE UPDATE ON public.page_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_homepage_blocks_updated_at
BEFORE UPDATE ON public.homepage_blocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();