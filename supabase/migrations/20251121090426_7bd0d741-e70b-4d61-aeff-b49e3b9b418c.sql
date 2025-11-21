-- Исправление критической уязвимости безопасности в таблице profiles
-- Ограничиваем доступ к персональным данным (email, phone)

-- Удаляем старую слишком открытую политику
DROP POLICY IF EXISTS "Профили видны всем аутентифициров" ON public.profiles;

-- Пользователи могут видеть только свой собственный профиль
CREATE POLICY "Пользователи видят свой профиль" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Админы и председатели могут видеть все профили (для управления)
CREATE POLICY "Админы и председатели видят все профили" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'chairman_zapovednoe'::user_role) OR 
  has_role(auth.uid(), 'chairman_kolosok'::user_role)
);