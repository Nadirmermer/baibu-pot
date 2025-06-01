-- ====================================================================
-- BAİBÜ PSİKOLOJİ KULÜBÜ - BASİT VE ÇALIŞIR BACKEND
-- ====================================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- Mevcut tabloları temizle
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- TEMEL TABLOLAR
-- ====================================================================

-- Users tablosu (auth.users ile senkronize)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles tablosu
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN (
        'baskan', 
        'baskan_yardimcisi', 
        'teknik_koordinator', 
        'teknik_ekip', 
        'etkinlik_koordinator', 
        'etkinlik_ekip', 
        'iletisim_koordinator', 
        'iletisim_ekip', 
        'dergi_koordinator', 
        'dergi_ekip'
    )),
    is_approved BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- News tablosu
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'genel' CHECK (category IN ('etkinlik', 'dergi', 'duyuru', 'genel')),
    featured_image TEXT,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT true,
    author_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tablosu
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    event_type TEXT NOT NULL DEFAULT 'seminer' CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    featured_image TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine issues tablosu
CREATE TABLE public.magazine_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    cover_image TEXT,
    pdf_file TEXT,
    publication_date DATE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors tablosu
CREATE TABLE public.sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT,
    sponsor_type TEXT NOT NULL DEFAULT 'destekci' CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'akademik')),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members tablosu
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT NOT NULL CHECK (team IN ('yonetim', 'teknik', 'etkinlik', 'iletisim', 'dergi')),
    bio TEXT,
    profile_image TEXT,
    linkedin_url TEXT,
    email TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic documents tablosu
CREATE TABLE public.academic_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('ders_notlari', 'arastirma', 'tez', 'makale', 'sunum', 'diger')),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    tags TEXT[],
    author TEXT,
    upload_date DATE DEFAULT CURRENT_DATE,
    downloads INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internships tablosu
CREATE TABLE public.internships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    application_deadline DATE,
    contact_info TEXT,
    application_link TEXT,
    internship_type TEXT CHECK (internship_type IN ('zorunlu', 'gönüllü', 'yaz', 'donem')),
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys tablosu
CREATE TABLE public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    survey_link TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages tablosu
CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments tablosu
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('news', 'event', 'magazine')),
    entity_id UUID NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- TRİGGER FONKSİYONLARI
-- ====================================================================

-- Auth.users ile sync için
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ====================================================================
-- TRİGGERLAR
-- ====================================================================

-- Auth user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger'ları
CREATE TRIGGER handle_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_user_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_news BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_magazine_issues BEFORE UPDATE ON public.magazine_issues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_sponsors BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_team_members BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_academic_documents BEFORE UPDATE ON public.academic_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_internships BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_surveys BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_comments BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- RLS POLİTİKALARI - BASİT VE PERMİSSİVE
-- ====================================================================

-- RLS'i etkinleştir
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Basit ve permissive politikalar

-- Users
CREATE POLICY "Herkes kullanıcıları görebilir" ON public.users FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendilerini güncelleyebilir" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Sistem kullanıcı oluşturabilir" ON public.users FOR INSERT WITH CHECK (true);

-- User roles
CREATE POLICY "Herkes rolleri görebilir" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Authenticated users rolleri yönetebilir" ON public.user_roles FOR ALL USING (auth.uid() IS NOT NULL);

-- News
CREATE POLICY "Herkes haberleri görebilir" ON public.news FOR SELECT USING (true);
CREATE POLICY "Authenticated users haberleri yönetebilir" ON public.news FOR ALL USING (auth.uid() IS NOT NULL);

-- Events
CREATE POLICY "Herkes etkinlikleri görebilir" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users etkinlikleri yönetebilir" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

-- Magazine issues
CREATE POLICY "Herkes dergileri görebilir" ON public.magazine_issues FOR SELECT USING (true);
CREATE POLICY "Authenticated users dergileri yönetebilir" ON public.magazine_issues FOR ALL USING (auth.uid() IS NOT NULL);

-- Sponsors
CREATE POLICY "Herkes sponsorları görebilir" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Authenticated users sponsorları yönetebilir" ON public.sponsors FOR ALL USING (auth.uid() IS NOT NULL);

-- Team members
CREATE POLICY "Herkes ekip üyelerini görebilir" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users ekip üyelerini yönetebilir" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);

-- Academic documents
CREATE POLICY "Herkes akademik belgeleri görebilir" ON public.academic_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users akademik belgeleri yönetebilir" ON public.academic_documents FOR ALL USING (auth.uid() IS NOT NULL);

-- Internships
CREATE POLICY "Herkes stajları görebilir" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Authenticated users stajları yönetebilir" ON public.internships FOR ALL USING (auth.uid() IS NOT NULL);

-- Surveys
CREATE POLICY "Herkes anketleri görebilir" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "Authenticated users anketleri yönetebilir" ON public.surveys FOR ALL USING (auth.uid() IS NOT NULL);

-- Contact messages
CREATE POLICY "Herkes mesaj gönderebilir" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users mesajları görebilir" ON public.contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users mesajları yönetebilir" ON public.contact_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- Comments
CREATE POLICY "Herkes onaylanmış yorumları görebilir" ON public.comments FOR SELECT USING (approved = true);
CREATE POLICY "Herkes yorum yapabilir" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users yorumları yönetebilir" ON public.comments FOR ALL USING (auth.uid() IS NOT NULL);

-- ====================================================================
-- TEST VERİLERİ
-- ====================================================================

-- Örnek haberler
INSERT INTO public.news (title, excerpt, content, category, slug, published) VALUES
('Psikoloji Günleri 2024 Başlıyor', 'Bu yıl 15-17 Mart tarihleri arasında düzenlenecek Psikoloji Günleri etkinlik programı açıklandı.', 'Detaylı içerik burada yer alacak...', 'etkinlik', 'psikoloji-gunleri-2024', true),
('Yeni Dergi Sayımız Yayında', 'Psikolojiİbu dergisinin 12. sayısı "Travma ve İyileşme" temasıyla okuyucularla buluştu.', 'Detaylı içerik burada yer alacak...', 'dergi', 'yeni-dergi-sayimiz', true),
('Staj Başvuruları Başladı', '2024 yaz dönemi staj başvuruları için yeni fırsatlar ve rehber bilgileri paylaşıldı.', 'Detaylı içerik burada yer alacak...', 'duyuru', 'staj-basvurulari', true);

-- Örnek etkinlikler
INSERT INTO public.events (title, description, event_date, location, event_type, max_participants, registration_required, slug, status) VALUES
('Mindfulness ve Stres Yönetimi Atölyesi', 'Günlük yaşamda stres yönetimi teknikleri üzerine interaktif bir atölye', '2024-04-25 14:00:00+03', 'Psikoloji Bölümü Konferans Salonu', 'atolye', 20, true, 'mindfulness-atolyesi', 'upcoming'),
('Psikoloji Kariyer Günleri', 'Psikoloji alanında kariyer fırsatları ve yol haritası', '2024-05-02 09:00:00+03', 'Rektörlük Konferans Salonu', 'konferans', 150, true, 'kariyer-gunleri', 'upcoming'),
('Kitap Kulübü Buluşması', 'Aylık kitap tartışması ve paylaşım etkinliği', '2024-04-10 18:30:00+03', 'Kütüphane Toplantı Salonu', 'sosyal', 15, false, 'kitap-kulubu', 'upcoming');

-- Örnek dergi sayısı
INSERT INTO public.magazine_issues (issue_number, title, theme, description, publication_date, slug, published) VALUES
(12, 'Travma ve İyileşme', 'Post-travmatik Stres Bozukluğu', 'Travma ve iyileşme süreçleri üzerine akademik çalışmalar ve klinik yaklaşımlar', '2024-03-01', 'sayi-12-travma', true);

-- Örnek sponsor
INSERT INTO public.sponsors (name, website, sponsor_type, active, sort_order) VALUES
('Bolu Abant İzzet Baysal Üniversitesi', 'https://baibu.edu.tr', 'akademik', true, 1);

-- Yetkileri ayarla
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- KURULUM TAMAMLANDI!
-- ====================================================================
-- Bu dosyayı çalıştırdıktan sonra:
-- 1. Supabase Authentication'dan bir kullanıcı oluşturun
-- 2. O kullanıcının ID'sini alıp user_roles tablosuna admin rolü ekleyin
-- 3. Artık tüm CRUD işlemleri çalışacak!
-- ====================================================================
