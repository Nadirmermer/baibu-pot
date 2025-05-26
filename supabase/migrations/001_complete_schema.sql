
-- Tüm tabloları ve politikaları temizle
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users tablosu - roller için
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roller tablosu
CREATE TABLE public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip', 'iletisim_koordinator', 'iletisim_ekip', 'dergi_koordinator', 'dergi_ekip')),
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- News tablosu
CREATE TABLE public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('etkinlik', 'dergi', 'duyuru', 'genel')),
    featured_image TEXT,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields tablosu (etkinlik ve anket formları için)
CREATE TABLE public.form_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey')),
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox')),
    field_label TEXT NOT NULL,
    field_name TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    options TEXT[], -- select, radio, checkbox seçenekleri için
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form responses tablosu
CREATE TABLE public.form_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('event_registration', 'survey')),
    user_name TEXT,
    user_email TEXT,
    response_data JSONB NOT NULL, -- Form yanıtları JSON formatında
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events tablosu
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('atolye', 'konferans', 'sosyal', 'egitim', 'seminer')),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    has_custom_form BOOLEAN DEFAULT false, -- Özel form var mı?
    featured_image TEXT,
    gallery_images TEXT[],
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine issues tablosu
CREATE TABLE public.magazine_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    cover_image TEXT,
    pdf_file TEXT,
    publication_date DATE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors tablosu
CREATE TABLE public.sponsors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT,
    sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('ana', 'destekci', 'medya', 'akademik')),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members tablosu (yıl bilgisi eklendi)
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT NOT NULL CHECK (team IN ('yonetim', 'teknik', 'etkinlik', 'iletisim', 'dergi')),
    year INTEGER NOT NULL, -- Hangi yıl görev yaptı
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('ders_notlari', 'arastirma', 'tez', 'makale', 'sunum', 'diger')),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER, -- Dosya boyutu (bytes)
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    application_deadline DATE,
    contact_info TEXT,
    application_link TEXT,
    internship_type TEXT CHECK (internship_type IN ('zorunlu', 'gönüllü', 'yaz', 'donem')),
    salary_info TEXT,
    duration_months INTEGER,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys tablosu
CREATE TABLE public.surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    survey_link TEXT, -- Harici anket linki
    has_custom_form BOOLEAN DEFAULT false, -- Özel form var mı?
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages tablosu
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments tablosu
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('news', 'event', 'magazine')),
    entity_id UUID NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_approved ON public.user_roles(is_approved);
CREATE INDEX idx_form_fields_form ON public.form_fields(form_id, form_type);
CREATE INDEX idx_form_responses_form ON public.form_responses(form_id, form_type);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_published ON public.news(published);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_magazine_published ON public.magazine_issues(published);
CREATE INDEX idx_sponsors_active ON public.sponsors(active);
CREATE INDEX idx_team_members_team ON public.team_members(team);
CREATE INDEX idx_team_members_year ON public.team_members(year);
CREATE INDEX idx_academic_documents_category ON public.academic_documents(category);
CREATE INDEX idx_internships_active ON public.internships(active);
CREATE INDEX idx_surveys_active ON public.surveys(active);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX idx_comments_approved ON public.comments(approved);

-- RLS etkinleştir
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

-- Basit RLS politikaları
CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Auth users can insert" ON public.users FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Public read user roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Auth users can insert roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update roles" ON public.user_roles FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read published news" ON public.news FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage news" ON public.news FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth users manage events" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read published magazines" ON public.magazine_issues FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage magazines" ON public.magazine_issues FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read active sponsors" ON public.sponsors FOR SELECT USING (active = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage sponsors" ON public.sponsors FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read active team members" ON public.team_members FOR SELECT USING (active = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage team members" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read documents" ON public.academic_documents FOR SELECT USING (true);
CREATE POLICY "Auth users manage documents" ON public.academic_documents FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read active internships" ON public.internships FOR SELECT USING (active = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage internships" ON public.internships FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read active surveys" ON public.surveys FOR SELECT USING (active = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth users manage surveys" ON public.surveys FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users read contact messages" ON public.contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users update contact messages" ON public.contact_messages FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read approved comments" ON public.comments FOR SELECT USING (approved = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users manage comments" ON public.comments FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public read form fields" ON public.form_fields FOR SELECT USING (true);
CREATE POLICY "Auth users manage form fields" ON public.form_fields FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public insert form responses" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users read form responses" ON public.form_responses FOR SELECT USING (auth.uid() IS NOT NULL);

-- Örnek veriler
INSERT INTO public.users (id, email, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@baibu.edu.tr', 'Admin User');

INSERT INTO public.user_roles (user_id, role, is_approved) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'baskan', true);

INSERT INTO public.news (title, excerpt, content, category, slug, published, author_id) VALUES 
('BAİBÜ Psikoloji Öğrenci Topluluğu Kuruldu', 'Üniversitemizde yeni bir öğrenci topluluğu kuruldu', 'BAİBÜ Psikoloji Öğrenci Topluluğu resmi olarak kurulmuştur. Topluluk, psikoloji öğrencilerinin akademik ve sosyal gelişimlerini desteklemeyi amaçlamaktadır.', 'duyuru', 'baibu-psikoloji-ogrenci-toplulugu-kuruldu', true, '550e8400-e29b-41d4-a716-446655440000');

INSERT INTO public.events (title, description, event_date, location, event_type, slug, status, created_by) VALUES 
('Klinik Psikoloji Semineri', 'Klinik psikoloji alanında güncel konuların ele alınacağı seminer', '2024-02-15 14:00:00+03', 'Konferans Salonu', 'seminer', 'klinik-psikoloji-semineri', 'upcoming', '550e8400-e29b-41d4-a716-446655440000');

INSERT INTO public.team_members (name, role, team, year, active) VALUES 
('Ahmet Yılmaz', 'Başkan', 'yonetim', 2024, true),
('Ayşe Demir', 'Başkan Yardımcısı', 'yonetim', 2024, true),
('Mehmet Öz', 'Eski Başkan', 'yonetim', 2010, false),
('Fatma Kara', 'Eski Teknik Koordinatör', 'teknik', 2010, false);
