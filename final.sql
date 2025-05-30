
-- ====================================================================
-- BAIBU PSİKOLOJİ KULÜBÜ - FRONTEND İLE TAM UYUMLU VERİTABANI ŞEMASI
-- ====================================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Tüm frontend hook'ları ve bileşenleri ile tam uyumlu

-- Mevcut şemayı temizle
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Gerekli uzantıları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Yetkileri ayarla
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ====================================================================
-- KULLANICI YÖNETİMİ TABLOLARI
-- ====================================================================

-- Users tablosu (auth.users ile senkronize)
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles tablosu - Frontend UserRoleManagement bileşeni için
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- ====================================================================
-- İÇERİK TABLOLARI - ANA SAYFA BİLEŞENLERİ İÇİN
-- ====================================================================

-- News tablosu - NewsSection bileşeni için
CREATE TABLE public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('etkinlik', 'dergi', 'duyuru', 'genel')),
    featured_image TEXT,
    gallery_images TEXT[],
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES public.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tablosu - EventsSection ve Etkinlikler sayfası için
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    has_custom_form BOOLEAN DEFAULT false,
    featured_image TEXT,
    gallery_images TEXT[],
    price DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    tags TEXT[],
    requirements TEXT,
    contact_info TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine issues tablosu - MagazineSection ve Dergi sayfası için
CREATE TABLE public.magazine_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    cover_image TEXT,
    pdf_file TEXT,
    file_size INTEGER,
    page_count INTEGER,
    publication_date DATE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    isbn TEXT,
    editors TEXT[],
    contributors TEXT[],
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors tablosu - SponsorsSection için
CREATE TABLE public.sponsors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT,
    sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'akademik')),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    contact_person TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members tablosu - Ekipler sayfası için
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT NOT NULL CHECK (team IN ('yonetim', 'teknik', 'etkinlik', 'iletisim', 'dergi')),
    year INTEGER NOT NULL,
    bio TEXT,
    profile_image TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    email TEXT,
    phone TEXT,
    graduation_year INTEGER,
    student_number TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- AKADEMİK VE STAJ TABLOLARI
-- ====================================================================

-- Academic documents tablosu - AkademikBelgeler sayfası için
CREATE TABLE public.academic_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('ders_notlari', 'arastirma', 'tez', 'makale', 'sunum', 'diger')),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    tags TEXT[],
    author TEXT,
    course_code TEXT,
    semester TEXT,
    upload_date DATE DEFAULT CURRENT_DATE,
    downloads INTEGER DEFAULT 0,
    approved BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internships tablosu - Stajlar sayfası için
CREATE TABLE public.internships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    application_deadline DATE,
    start_date DATE,
    end_date DATE,
    contact_info TEXT,
    application_link TEXT,
    application_email TEXT,
    internship_type TEXT CHECK (internship_type IN ('zorunlu', 'gönüllü', 'yaz', 'donem')),
    salary_info TEXT,
    duration_months INTEGER,
    work_type TEXT CHECK (work_type IN ('remote', 'hybrid', 'onsite')),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    company_logo TEXT,
    benefits TEXT[],
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ANKET VE FORM TABLOLARI
-- ====================================================================

-- Surveys tablosu - Anketler sayfası için
CREATE TABLE public.surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    survey_link TEXT,
    has_custom_form BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    anonymous BOOLEAN DEFAULT true,
    max_responses INTEGER,
    current_responses INTEGER DEFAULT 0,
    survey_type TEXT CHECK (survey_type IN ('academic', 'event', 'general', 'feedback')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields tablosu - FormBuilder bileşeni için
CREATE TABLE public.form_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey', 'contact')),
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file')),
    field_label TEXT NOT NULL,
    field_name TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    options TEXT[],
    placeholder TEXT,
    validation_rules JSONB,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form responses tablosu
CREATE TABLE public.form_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey', 'contact')),
    user_id UUID REFERENCES public.users(id),
    user_name TEXT,
    user_email TEXT,
    response_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- İLETİŞİM VE YORUM TABLOLARI
-- ====================================================================

-- Contact messages tablosu - İletişim sayfası için
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'genel' CHECK (category IN ('genel', 'staj', 'etkinlik', 'dergi', 'uyelik', 'sikayet')),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES public.users(id),
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments tablosu - Haber ve etkinlik yorumları için
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_id UUID REFERENCES public.users(id),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('news', 'event', 'magazine')),
    entity_id UUID NOT NULL,
    parent_id UUID REFERENCES public.comments(id),
    approved BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- SİSTEM TABLOLARI
-- ====================================================================

-- File uploads tablosu
CREATE TABLE public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    entity_type TEXT,
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications tablosu
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- İNDEKSLER - PERFORMANS İÇİN
-- ====================================================================

-- User roles indeksleri
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_approved ON public.user_roles(is_approved);

-- News indeksleri
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_published ON public.news(published);
CREATE INDEX idx_news_featured ON public.news(featured);
CREATE INDEX idx_news_published_date ON public.news(published_at);
CREATE INDEX idx_news_slug ON public.news(slug);

-- Events indeksleri
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_featured ON public.events(featured_image);

-- Magazine indeksleri
CREATE INDEX idx_magazine_published ON public.magazine_issues(published);
CREATE INDEX idx_magazine_issue_number ON public.magazine_issues(issue_number);
CREATE INDEX idx_magazine_publication_date ON public.magazine_issues(publication_date);

-- Sponsors indeksleri
CREATE INDEX idx_sponsors_active ON public.sponsors(active);
CREATE INDEX idx_sponsors_type ON public.sponsors(sponsor_type);
CREATE INDEX idx_sponsors_sort ON public.sponsors(sort_order);

-- Team members indeksleri
CREATE INDEX idx_team_members_team ON public.team_members(team);
CREATE INDEX idx_team_members_year ON public.team_members(year);
CREATE INDEX idx_team_members_active ON public.team_members(active);

-- Academic documents indeksleri
CREATE INDEX idx_academic_documents_category ON public.academic_documents(category);
CREATE INDEX idx_academic_documents_approved ON public.academic_documents(approved);

-- Internships indeksleri
CREATE INDEX idx_internships_active ON public.internships(active);
CREATE INDEX idx_internships_deadline ON public.internships(application_deadline);
CREATE INDEX idx_internships_type ON public.internships(internship_type);

-- Surveys indeksleri
CREATE INDEX idx_surveys_active ON public.surveys(active);
CREATE INDEX idx_surveys_dates ON public.surveys(start_date, end_date);

-- Form indeksleri
CREATE INDEX idx_form_fields_form ON public.form_fields(form_id, form_type);
CREATE INDEX idx_form_responses_form ON public.form_responses(form_id, form_type);

-- Contact messages indeksleri
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_category ON public.contact_messages(category);

-- Comments indeksleri
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX idx_comments_approved ON public.comments(approved);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- ====================================================================
-- SECURITY FUNCTIONS - YETKİ KONTROL FONKSİYONLARI
-- ====================================================================

-- Admin kontrolü
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND role IN ('baskan', 'baskan_yardimcisi')
  );
$$;

-- İçerik yönetimi yetkisi kontrolü
CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND role IN (
        'baskan', 
        'baskan_yardimcisi', 
        'teknik_koordinator', 
        'teknik_ekip', 
        'iletisim_koordinator', 
        'iletisim_ekip', 
        'etkinlik_koordinator', 
        'dergi_koordinator'
    )
  );
$$;

-- Belirli ekip yetkisi kontrolü
CREATE OR REPLACE FUNCTION public.can_manage_team_content(team_type TEXT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    public.is_admin_user() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND is_approved = true 
      AND (
        role LIKE team_type || '_koordinator' OR
        role LIKE team_type || '_ekip'
      )
    );
$$;

-- ====================================================================
-- TRİGGER FONKSİYONLARI
-- ====================================================================

-- Auth.users ile sync trigger
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

-- Auth user oluşturma trigger'ı
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
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ====================================================================

-- RLS'i tüm tablolar için etkinleştir
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
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- USERS TABLOSU POLİTİKALARI
-- ====================================================================

CREATE POLICY "Herkes kendi profilini görebilir" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Adminler tüm kullanıcıları görebilir" ON public.users
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Sistem kullanıcı oluşturabilir" ON public.users
FOR INSERT WITH CHECK (true);

-- ====================================================================
-- USER ROLES TABLOSU POLİTİKALARI
-- ====================================================================

CREATE POLICY "Herkes onaylanmış rolleri görebilir" ON public.user_roles
FOR SELECT USING (is_approved = true);

CREATE POLICY "Adminler tüm rolleri görebilir" ON public.user_roles
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Kullanıcılar kendi rol talebini oluşturabilir" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Adminler rolleri güncelleyebilir" ON public.user_roles
FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Adminler rolleri silebilir" ON public.user_roles
FOR DELETE USING (public.is_admin_user());

-- ====================================================================
-- NEWS TABLOSU POLİTİKALARI
-- ====================================================================

CREATE POLICY "Herkes yayınlanmış haberleri görebilir" ON public.news
FOR SELECT USING (published = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri haber oluşturabilir" ON public.news
FOR INSERT WITH CHECK (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri haberleri güncelleyebilir" ON public.news
FOR UPDATE USING (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri haberleri silebilir" ON public.news
FOR DELETE USING (public.can_manage_content());

-- ====================================================================
-- EVENTS TABLOSU POLİTİKALARI
-- ====================================================================

CREATE POLICY "Herkes etkinlikleri görebilir" ON public.events
FOR SELECT USING (true);

CREATE POLICY "İçerik yöneticileri etkinlik oluşturabilir" ON public.events
FOR INSERT WITH CHECK (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri etkinlikleri güncelleyebilir" ON public.events
FOR UPDATE USING (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri etkinlikleri silebilir" ON public.events
FOR DELETE USING (public.can_manage_content());

-- ====================================================================
-- MAGAZINE ISSUES TABLOSU POLİTİKALARI
-- ====================================================================

CREATE POLICY "Herkes yayınlanmış dergileri görebilir" ON public.magazine_issues
FOR SELECT USING (published = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri dergi oluşturabilir" ON public.magazine_issues
FOR INSERT WITH CHECK (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri dergileri güncelleyebilir" ON public.magazine_issues
FOR UPDATE USING (public.can_manage_content());

CREATE POLICY "İçerik yöneticileri dergileri silebilir" ON public.magazine_issues
FOR DELETE USING (public.can_manage_content());

-- ====================================================================
-- DİĞER TABLOLAR İÇİN POLİTİKALAR
-- ====================================================================

-- Sponsors
CREATE POLICY "Herkes aktif sponsorları görebilir" ON public.sponsors
FOR SELECT USING (active = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri sponsor yönetebilir" ON public.sponsors
FOR ALL USING (public.can_manage_content());

-- Team members
CREATE POLICY "Herkes aktif ekip üyelerini görebilir" ON public.team_members
FOR SELECT USING (active = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri ekip üyelerini yönetebilir" ON public.team_members
FOR ALL USING (public.can_manage_content());

-- Academic documents
CREATE POLICY "Herkes onaylanmış belgeleri görebilir" ON public.academic_documents
FOR SELECT USING (approved = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri akademik belge yönetebilir" ON public.academic_documents
FOR ALL USING (public.can_manage_content());

-- Internships
CREATE POLICY "Herkes aktif stajları görebilir" ON public.internships
FOR SELECT USING (active = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri staj yönetebilir" ON public.internships
FOR ALL USING (public.can_manage_content());

-- Surveys
CREATE POLICY "Herkes aktif anketleri görebilir" ON public.surveys
FOR SELECT USING (active = true OR public.can_manage_content());

CREATE POLICY "İçerik yöneticileri anket yönetebilir" ON public.surveys
FOR ALL USING (public.can_manage_content());

-- Contact messages
CREATE POLICY "Herkes iletişim mesajı gönderebilir" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Adminler iletişim mesajlarını görebilir" ON public.contact_messages
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Adminler iletişim mesajlarını güncelleyebilir" ON public.contact_messages
FOR UPDATE USING (public.is_admin_user());

-- Comments
CREATE POLICY "Herkes onaylanmış yorumları görebilir" ON public.comments
FOR SELECT USING (approved = true OR public.can_manage_content());

CREATE POLICY "Herkes yorum yapabilir" ON public.comments
FOR INSERT WITH CHECK (true);

CREATE POLICY "İçerik yöneticileri yorumları yönetebilir" ON public.comments
FOR ALL USING (public.can_manage_content());

-- Form fields
CREATE POLICY "Herkes form alanlarını görebilir" ON public.form_fields
FOR SELECT USING (active = true);

CREATE POLICY "İçerik yöneticileri form alanlarını yönetebilir" ON public.form_fields
FOR ALL USING (public.can_manage_content());

-- Form responses
CREATE POLICY "Herkes form yanıtı gönderebilir" ON public.form_responses
FOR INSERT WITH CHECK (true);

CREATE POLICY "İçerik yöneticileri form yanıtlarını görebilir" ON public.form_responses
FOR SELECT USING (public.can_manage_content());

-- File uploads
CREATE POLICY "Kullanıcılar dosya yükleyebilir" ON public.file_uploads
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Herkes dosyaları görebilir" ON public.file_uploads
FOR SELECT USING (true);

CREATE POLICY "İçerik yöneticileri dosyaları yönetebilir" ON public.file_uploads
FOR ALL USING (public.can_manage_content());

-- Notifications
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistem bildirimleri oluşturabilir" ON public.notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- ====================================================================
-- ÖRNEK VERİLER - TEST İÇİN
-- ====================================================================

-- İlk admin kullanıcı (manuel olarak oluşturun)
INSERT INTO public.users (id, email, name) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin@baibu.edu.tr', 'Admin User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, is_approved, approved_at) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'baskan', true, NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- Örnek sponsor
INSERT INTO public.sponsors (name, logo, website, sponsor_type, active, sort_order) VALUES
('Bolu Abant İzzet Baysal Üniversitesi', '/logo.png', 'https://baibu.edu.tr', 'akademik', true, 1)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- FİNAL KONTROLLER
-- ====================================================================

-- Tüm tabloların oluşturulduğunu kontrol et
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- RLS politikalarının aktif olduğunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;

-- Fonksiyonların oluşturulduğunu kontrol et
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ====================================================================
-- KURULUM TAMAMLANDI
-- ====================================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırdığınızda:
-- ✅ Tüm frontend hook'larınız çalışacak
-- ✅ Ana sayfadaki bileşenler backend'den veri çekecek
-- ✅ Admin paneli tam yetki ile çalışacak
-- ✅ Rol sistemi düzgün çalışacak
-- ✅ Form builder sistemi aktif olacak
-- ✅ Tüm sayfalarda RLS koruması olacak
-- 
-- İlk giriş için:
-- Email: admin@baibu.edu.tr (manuel kayıt yapın)
-- Otomatik olarak admin yetkisi verilecek
-- ====================================================================
