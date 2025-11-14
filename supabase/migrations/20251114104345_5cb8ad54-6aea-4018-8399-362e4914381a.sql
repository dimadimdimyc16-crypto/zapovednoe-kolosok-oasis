-- Enum для статуса участков
CREATE TYPE plot_status AS ENUM ('available', 'reserved', 'sold');

-- Enum для поселков
CREATE TYPE settlement_type AS ENUM ('zapovednoe', 'kolosok');

-- Enum для ролей пользователей
CREATE TYPE user_role AS ENUM ('admin', 'chairman_zapovednoe', 'chairman_kolosok', 'resident_zapovednoe', 'resident_kolosok');

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Таблица участков
CREATE TABLE public.plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement settlement_type NOT NULL,
  plot_number TEXT NOT NULL,
  area_sqm NUMERIC NOT NULL,
  price_rub NUMERIC NOT NULL,
  status plot_status NOT NULL DEFAULT 'available',
  cadastral_number TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  description TEXT,
  advantages JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(settlement, plot_number)
);

-- Таблица документов
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement settlement_type NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  category TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица новостей
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement settlement_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  category TEXT,
  author_id UUID REFERENCES public.profiles(id),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица галереи
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement settlement_type NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Функция для проверки роли
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Функция для проверки, является ли пользователь жителем поселка
CREATE OR REPLACE FUNCTION public.is_resident_of(_user_id UUID, _settlement settlement_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND (
      role = 'admin' 
      OR (_settlement = 'zapovednoe' AND role IN ('chairman_zapovednoe', 'resident_zapovednoe'))
      OR (_settlement = 'kolosok' AND role IN ('chairman_kolosok', 'resident_kolosok'))
    )
  )
$$;

-- Триггер для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Пользователь'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Триггеры для updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plots_updated_at BEFORE UPDATE ON public.plots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies для profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Профили видны всем аутентифицированным" ON public.profiles
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies для user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Роли видны администраторам и председателям" ON public.user_roles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );

CREATE POLICY "Только админы и председатели могут назначать роли" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );

-- RLS Policies для plots (участки видны всем)
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Участки видны всем" ON public.plots
  FOR SELECT USING (TRUE);

CREATE POLICY "Только админы и председатели могут управлять участками" ON public.plots
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );

-- RLS Policies для documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Публичные документы видны всем" ON public.documents
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Приватные документы видны только жителям своего поселка" ON public.documents
  FOR SELECT TO authenticated USING (
    is_public = FALSE AND public.is_resident_of(auth.uid(), settlement)
  );

CREATE POLICY "Админы и председатели могут управлять документами" ON public.documents
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );

-- RLS Policies для news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Опубликованные новости видны всем" ON public.news
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Админы и председатели могут управлять новостями" ON public.news
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );

-- RLS Policies для gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Галерея видна всем" ON public.gallery
  FOR SELECT USING (TRUE);

CREATE POLICY "Админы и председатели могут управлять галереей" ON public.gallery
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'chairman_zapovednoe') OR
    public.has_role(auth.uid(), 'chairman_kolosok')
  );