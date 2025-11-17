-- Создание таблицы для обращений в поддержку
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  settlement settlement_type NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.profiles(id)
);

-- Включаем RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Все могут создавать обращения"
  ON public.support_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Админы и председатели видят обращения своего поселка"
  ON public.support_requests
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::user_role) OR
    (settlement = 'zapovednoe' AND has_role(auth.uid(), 'chairman_zapovednoe'::user_role)) OR
    (settlement = 'kolosok' AND has_role(auth.uid(), 'chairman_kolosok'::user_role))
  );

CREATE POLICY "Админы и председатели могут обновлять обращения своего поселка"
  ON public.support_requests
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::user_role) OR
    (settlement = 'zapovednoe' AND has_role(auth.uid(), 'chairman_zapovednoe'::user_role)) OR
    (settlement = 'kolosok' AND has_role(auth.uid(), 'chairman_kolosok'::user_role))
  );

-- Триггер для обновления updated_at
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();