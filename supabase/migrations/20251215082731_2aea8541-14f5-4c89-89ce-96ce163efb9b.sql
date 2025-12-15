-- Create site_settings table for managing contact info and site configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement settlement_type NOT NULL,
  site_name text NOT NULL DEFAULT 'Заповедное & Колосок',
  site_description text,
  contact_email text,
  contact_phone text,
  address text,
  working_hours_weekdays text,
  working_hours_weekends text,
  telegram text,
  whatsapp text,
  vk_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (settlement)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can view settings
CREATE POLICY "Public can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins and chairmen can manage settings
CREATE POLICY "Admins and chairmen can manage settings"
ON public.site_settings
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'chairman_zapovednoe') OR 
  has_role(auth.uid(), 'chairman_kolosok')
);

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default settings for both settlements
INSERT INTO public.site_settings (settlement, site_name, site_description, contact_email, contact_phone, address, working_hours_weekdays, working_hours_weekends, telegram, whatsapp)
VALUES 
  ('zapovednoe', 'ДПК Заповедное', 'Премиальная загородная недвижимость', 'info@zapovednoe.ru', '+7 (495) 123-45-67', 'Московская область, Истринский район, ДПК Заповедное', '9:00 - 19:00', '10:00 - 17:00', '@zapovednoe_dpk', '+7 (495) 123-45-67'),
  ('kolosok', 'ДПК Колосок', 'Комфортная загородная жизнь', 'info@kolosok-dpk.ru', '+7 (495) 765-43-21', 'Московская область, Чеховский район, ДПК Колосок', '9:00 - 18:00', '10:00 - 16:00', '@kolosok_dpk', '+7 (495) 765-43-21');