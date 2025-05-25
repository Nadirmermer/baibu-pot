
-- Complete BAİBÜ PÖT website schema with all tables, policies, and sample data
-- This single migration creates the entire application database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.internships CASCADE;
DROP TABLE IF EXISTS public.academic_documents CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.sponsors CASCADE;
DROP TABLE IF EXISTS public.magazine_issues CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table for admin authentication and roles
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip', 'iletisim_koordinator', 'iletisim_ekip', 'dergi_koordinator', 'dergi_ekip')),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News and announcements
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

-- Events
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
    featured_image TEXT,
    gallery_images TEXT[],
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    slug TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine issues
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

-- Sponsors
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

-- Team members
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Academic documents
CREATE TABLE public.academic_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Internship opportunities
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
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys
CREATE TABLE public.surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    survey_link TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments for news, events, and magazine issues
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

-- Create indexes for better performance
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_published ON public.news(published);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_magazine_published ON public.magazine_issues(published);
CREATE INDEX idx_sponsors_active ON public.sponsors(active);
CREATE INDEX idx_team_members_team ON public.team_members(team);
CREATE INDEX idx_academic_documents_category ON public.academic_documents(category);
CREATE INDEX idx_internships_active ON public.internships(active);
CREATE INDEX idx_surveys_active ON public.surveys(active);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX idx_comments_approved ON public.comments(approved);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view approved users" ON public.users
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator')
            AND is_approved = true
        )
    );

-- News table policies
CREATE POLICY "Anyone can view published news" ON public.news
    FOR SELECT USING (published = true);

CREATE POLICY "Authorized users can manage news" ON public.news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Events table policies
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Authorized users can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip')
            AND is_approved = true
        )
    );

-- Magazine issues table policies
CREATE POLICY "Anyone can view published magazine issues" ON public.magazine_issues
    FOR SELECT USING (published = true);

CREATE POLICY "Authorized users can manage magazine" ON public.magazine_issues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'dergi_koordinator', 'dergi_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Sponsors table policies
CREATE POLICY "Anyone can view active sponsors" ON public.sponsors
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage sponsors" ON public.sponsors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'etkinlik_koordinator', 'etkinlik_ekip', 'dergi_koordinator', 'dergi_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Team members table policies
CREATE POLICY "Anyone can view active team members" ON public.team_members
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator')
            AND is_approved = true
        )
    );

-- Academic documents table policies
CREATE POLICY "Anyone can view academic documents" ON public.academic_documents
    FOR SELECT USING (true);

CREATE POLICY "Authorized users can manage academic documents" ON public.academic_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Internships table policies
CREATE POLICY "Anyone can view active internships" ON public.internships
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage internships" ON public.internships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Surveys table policies
CREATE POLICY "Anyone can view active surveys" ON public.surveys
    FOR SELECT USING (active = true);

CREATE POLICY "Authorized users can manage surveys" ON public.surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'teknik_ekip', 'iletisim_koordinator', 'iletisim_ekip')
            AND is_approved = true
        )
    );

-- Contact messages table policies
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authorized users can view contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'iletisim_koordinator')
            AND is_approved = true
        )
    );

CREATE POLICY "Authorized users can update contact messages" ON public.contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'iletisim_koordinator')
            AND is_approved = true
        )
    );

-- Comments table policies
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authorized users can manage comments" ON public.comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('baskan', 'baskan_yardimcisi', 'teknik_koordinator', 'iletisim_koordinator')
            AND is_approved = true
        )
    );
