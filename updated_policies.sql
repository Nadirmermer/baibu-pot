
-- RLS politikalarını geçici olarak daha esnek hale getirelim
-- Önce mevcut politikaları kaldıralım ve yenilerini ekleyelim

-- NEWS tablosu için
DROP POLICY IF EXISTS "Herkes yayınlanmış haberleri görebilir" ON public.news;
DROP POLICY IF EXISTS "İçerik yöneticileri haber oluşturabilir" ON public.news;
DROP POLICY IF EXISTS "İçerik yöneticileri haberleri güncelleyebilir" ON public.news;
DROP POLICY IF EXISTS "İçerik yöneticileri haberleri silebilir" ON public.news;

CREATE POLICY "Herkes haberleri okuyabilir" ON public.news
FOR SELECT USING (true);

CREATE POLICY "Authenticated users haberleri yönetebilir" ON public.news
FOR ALL USING (auth.uid() IS NOT NULL);

-- EVENTS tablosu için
DROP POLICY IF EXISTS "Herkes etkinlikleri görebilir" ON public.events;
DROP POLICY IF EXISTS "İçerik yöneticileri etkinlik oluşturabilir" ON public.events;
DROP POLICY IF EXISTS "İçerik yöneticileri etkinlikleri güncelleyebilir" ON public.events;
DROP POLICY IF EXISTS "İçerik yöneticileri etkinlikleri silebilir" ON public.events;

CREATE POLICY "Herkes etkinlikleri okuyabilir" ON public.events
FOR SELECT USING (true);

CREATE POLICY "Authenticated users etkinlikleri yönetebilir" ON public.events
FOR ALL USING (auth.uid() IS NOT NULL);

-- SPONSORS tablosu için
DROP POLICY IF EXISTS "Herkes aktif sponsorları görebilir" ON public.sponsors;
DROP POLICY IF EXISTS "İçerik yöneticileri sponsor yönetebilir" ON public.sponsors;

CREATE POLICY "Herkes sponsorları okuyabilir" ON public.sponsors
FOR SELECT USING (true);

CREATE POLICY "Authenticated users sponsorları yönetebilir" ON public.sponsors
FOR ALL USING (auth.uid() IS NOT NULL);

-- SURVEYS tablosu için
DROP POLICY IF EXISTS "Herkes aktif anketleri görebilir" ON public.surveys;
DROP POLICY IF EXISTS "İçerik yöneticileri anket yönetebilir" ON public.surveys;

CREATE POLICY "Herkes anketleri okuyabilir" ON public.surveys
FOR SELECT USING (true);

CREATE POLICY "Authenticated users anketleri yönetebilir" ON public.surveys
FOR ALL USING (auth.uid() IS NOT NULL);

-- MAGAZINE ISSUES tablosu için
DROP POLICY IF EXISTS "Herkes yayınlanmış dergileri görebilir" ON public.magazine_issues;
DROP POLICY IF EXISTS "İçerik yöneticileri dergi oluşturabilir" ON public.magazine_issues;
DROP POLICY IF EXISTS "İçerik yöneticileri dergileri güncelleyebilir" ON public.magazine_issues;
DROP POLICY IF EXISTS "İçerik yöneticileri dergileri silebilir" ON public.magazine_issues;

CREATE POLICY "Herkes dergileri okuyabilir" ON public.magazine_issues
FOR SELECT USING (true);

CREATE POLICY "Authenticated users dergileri yönetebilir" ON public.magazine_issues
FOR ALL USING (auth.uid() IS NOT NULL);

-- USER_ROLES tablosu için
DROP POLICY IF EXISTS "Herkes onaylanmış rolleri görebilir" ON public.user_roles;
DROP POLICY IF EXISTS "Adminler tüm rolleri görebilir" ON public.user_roles;
DROP POLICY IF EXISTS "Kullanıcılar kendi rol talebini oluşturabilir" ON public.user_roles;
DROP POLICY IF EXISTS "Adminler rolleri güncelleyebilir" ON public.user_roles;
DROP POLICY IF EXISTS "Adminler rolleri silebilir" ON public.user_roles;

CREATE POLICY "Herkes rolleri okuyabilir" ON public.user_roles
FOR SELECT USING (true);

CREATE POLICY "Authenticated users rolleri yönetebilir" ON public.user_roles
FOR ALL USING (auth.uid() IS NOT NULL);

-- USERS tablosu için
DROP POLICY IF EXISTS "Herkes kendi profilini görebilir" ON public.users;
DROP POLICY IF EXISTS "Adminler tüm kullanıcıları görebilir" ON public.users;
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini güncelleyebilir" ON public.users;
DROP POLICY IF EXISTS "Sistem kullanıcı oluşturabilir" ON public.users;

CREATE POLICY "Herkes kullanıcıları okuyabilir" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Authenticated users kullanıcıları yönetebilir" ON public.users
FOR ALL USING (auth.uid() IS NOT NULL);

-- Diğer tüm tablolar için de benzer politikalar
CREATE POLICY "Herkes okuyabilir" ON public.contact_messages
FOR SELECT USING (true);

CREATE POLICY "Herkes yazabilir" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users yönetebilir" ON public.contact_messages
FOR ALL USING (auth.uid() IS NOT NULL);

-- Team members, academic documents, internships için
CREATE POLICY "Herkes okuyabilir team_members" ON public.team_members
FOR SELECT USING (true);

CREATE POLICY "Authenticated users yönetebilir team_members" ON public.team_members
FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Herkes okuyabilir academic_documents" ON public.academic_documents
FOR SELECT USING (true);

CREATE POLICY "Authenticated users yönetebilir academic_documents" ON public.academic_documents
FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Herkes okuyabilir internships" ON public.internships
FOR SELECT USING (true);

CREATE POLICY "Authenticated users yönetebilir internships" ON public.internships
FOR ALL USING (auth.uid() IS NOT NULL);

-- Kullanıcınızı admin yapalım
INSERT INTO public.users (id, email, name) 
VALUES ('3b2ae6e5-c7e7-4e5f-9c89-c1f87dca4b32', 'admin@baibu.edu.tr', 'Büşe Seher Çetin')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name;

INSERT INTO public.user_roles (user_id, role, is_approved, approved_at) 
VALUES ('3b2ae6e5-c7e7-4e5f-9c89-c1f87dca4b32', 'baskan', true, NOW())
ON CONFLICT (user_id, role) DO UPDATE SET 
  is_approved = true,
  approved_at = NOW();

-- Debug için fonksiyon
CREATE OR REPLACE FUNCTION debug_user_auth()
RETURNS TABLE(
  current_user_id uuid,
  current_user_email text,
  has_roles boolean,
  user_roles text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()),
    ARRAY(SELECT role FROM public.user_roles WHERE user_id = auth.uid() AND is_approved = true)
$$;
