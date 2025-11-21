-- Улучшение безопасности таблицы support_requests
-- Явно указываем, что SELECT доступен только аутентифицированным пользователям

-- Удаляем старую политику
DROP POLICY IF EXISTS "Админы и председатели видят обращ" ON public.support_requests;

-- Создаем новую политику с явным ограничением TO authenticated
CREATE POLICY "Админы и председатели видят обращения" 
ON public.support_requests 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  ((settlement = 'zapovednoe'::settlement_type) AND has_role(auth.uid(), 'chairman_zapovednoe'::user_role)) OR 
  ((settlement = 'kolosok'::settlement_type) AND has_role(auth.uid(), 'chairman_kolosok'::user_role))
);

-- Также обновим UPDATE политику для консистентности
DROP POLICY IF EXISTS "Админы и председатели могут обнов" ON public.support_requests;

CREATE POLICY "Админы и председатели могут обновлять обращения" 
ON public.support_requests 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  ((settlement = 'zapovednoe'::settlement_type) AND has_role(auth.uid(), 'chairman_zapovednoe'::user_role)) OR 
  ((settlement = 'kolosok'::settlement_type) AND has_role(auth.uid(), 'chairman_kolosok'::user_role))
);