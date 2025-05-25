import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Building2,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import NewsModal from '@/components/admin/NewsModal';
import EventModal from '@/components/admin/EventModal';
import MagazineModal from '@/components/admin/MagazineModal';
import { useNews, useEvents, useMagazineIssues, useSurveys, useSponsors, useTeamMembers, useAcademicDocuments, useInternships, useContactMessages } from '@/hooks/useSupabaseData';

interface User {
  email: string;
  role: string;
  name?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [magazineModalOpen, setMagazineModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data hooks
  const { data: allNews = [], refetch: refetchNews } = useNews(false);
  const { data: events = [], refetch: refetchEvents } = useEvents();
  const { data: magazines = [], refetch: refetchMagazines } = useMagazineIssues(false);
  const { data: surveys = [] } = useSurveys();
  const { data: sponsors = [] } = useSponsors(false);
  const { data: teamMembers = [] } = useTeamMembers(false);
  const { data: documents = [] } = useAcademicDocuments();
  const { data: internships = [] } = useInternships(false);
  const { data: messages = [] } = useContactMessages();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
      return;
    }
    setUser({
      email: user.email || '',
      role: 'baskan', // This should come from user metadata or users table
      name: user.user_metadata?.name
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getRolePermissions = (role: string) => {
    const permissions = {
      baskan: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'messages', 'users'],
      baskan_yardimcisi: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'messages', 'users'],
      teknik_koordinator: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'team', 'documents', 'internships', 'users'],
      teknik_ekip: ['news', 'events', 'magazine', 'surveys', 'sponsors', 'documents', 'internships'],
      etkinlik_koordinator: ['events', 'sponsors'],
      etkinlik_ekip: ['events', 'sponsors'],
      iletisim_koordinator: ['news', 'magazine', 'surveys', 'sponsors', 'documents', 'internships', 'messages'],
      iletisim_ekip: ['news', 'magazine', 'surveys', 'sponsors', 'documents', 'internships'],
      dergi_koordinator: ['magazine', 'sponsors'],
      dergi_ekip: ['magazine', 'sponsors']
    };
    return permissions[role as keyof typeof permissions] || [];
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return getRolePermissions(user.role).includes(permission);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      baskan: 'Başkan',
      baskan_yardimcisi: 'Başkan Yardımcısı',
      teknik_koordinator: 'Teknik İşler Koordinatörü',
      teknik_ekip: 'Teknik İşler Ekip Üyesi',
      etkinlik_koordinator: 'Etkinlik Koordinatörü',
      etkinlik_ekip: 'Etkinlik Ekip Üyesi',
      iletisim_koordinator: 'İletişim Koordinatörü',
      iletisim_ekip: 'İletişim Ekip Üyesi',
      dergi_koordinator: 'Dergi Koordinatörü',
      dergi_ekip: 'Dergi Ekip Üyesi'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const handleSaveNews = async (newsData: any) => {
    try {
      if (editingItem) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Haber güncellendi');
      } else {
        // Create new news
        const { error } = await supabase
          .from('news')
          .insert([{ ...newsData, author_id: user?.email }]);
        if (error) throw error;
        toast.success('Haber eklendi');
      }
      refetchNews();
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving news:', error);
    }
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Etkinlik güncellendi');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ ...eventData, created_by: user?.email }]);
        if (error) throw error;
        toast.success('Etkinlik eklendi');
      }
      refetchEvents();
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving event:', error);
    }
  };

  const handleSaveMagazine = async (magazineData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('magazine_issues')
          .update(magazineData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Dergi güncellendi');
      } else {
        const { error } = await supabase
          .from('magazine_issues')
          .insert([{ ...magazineData, created_by: user?.email }]);
        if (error) throw error;
        toast.success('Dergi eklendi');
      }
      refetchMagazines();
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving magazine:', error);
    }
  };

  const openEditModal = (item: any, type: 'news' | 'event' | 'magazine') => {
    setEditingItem(item);
    if (type === 'news') setNewsModalOpen(true);
    else if (type === 'event') setEventModalOpen(true);
    else if (type === 'magazine') setMagazineModalOpen(true);
  };

  const handleDelete = async (id: string, table: string, refetchFn: () => void) => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Öğe silindi');
      refetchFn();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting:', error);
    }
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <LayoutDashboard className="h-8 w-8 text-cyan-500 mr-3" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Admin Paneli
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Sekme listesi */}
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-1">
              <TabsTrigger value="dashboard" className="text-xs">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Genel
              </TabsTrigger>
              {hasPermission('news') && (
                <TabsTrigger value="news" className="text-xs">
                  <FileText className="h-4 w-4 mr-1" />
                  Haberler
                </TabsTrigger>
              )}
              {hasPermission('events') && (
                <TabsTrigger value="events" className="text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  Etkinlikler
                </TabsTrigger>
              )}
              {hasPermission('magazine') && (
                <TabsTrigger value="magazine" className="text-xs">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Dergi
                </TabsTrigger>
              )}
              {hasPermission('surveys') && (
                <TabsTrigger value="surveys" className="text-xs">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Anketler
                </TabsTrigger>
              )}
              {hasPermission('sponsors') && (
                <TabsTrigger value="sponsors" className="text-xs">
                  <Building2 className="h-4 w-4 mr-1" />
                  Sponsorlar
                </TabsTrigger>
              )}
              {hasPermission('team') && (
                <TabsTrigger value="team" className="text-xs">
                  <Users className="h-4 w-4 mr-1" />
                  Ekipler
                </TabsTrigger>
              )}
              {hasPermission('documents') && (
                <TabsTrigger value="documents" className="text-xs">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Belgeler
                </TabsTrigger>
              )}
              {hasPermission('internships') && (
                <TabsTrigger value="internships" className="text-xs">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Staj
                </TabsTrigger>
              )}
              {hasPermission('messages') && (
                <TabsTrigger value="messages" className="text-xs">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Mesajlar
                </TabsTrigger>
              )}
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Haberler</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allNews.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {allNews.filter(n => n.published).length} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Etkinlikler</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{events.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {events.filter(e => e.status === 'upcoming').length} yaklaşan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dergi Sayıları</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{magazines.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {magazines.filter(m => m.published).length} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{messages.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {messages.filter(m => m.status === 'unread').length} okunmamış
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* News Tab */}
            {hasPermission('news') && (
              <TabsContent value="news" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Haberler ve Duyurular</h2>
                  <Button onClick={() => { setEditingItem(null); setNewsModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Haber
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {allNews.map(news => (
                        <div key={news.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{news.title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{news.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(news.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={news.published ? "default" : "secondary"}>
                                {news.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(news, 'news')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(news.id, 'news', refetchNews)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {allNews.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Henüz haber bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Events Tab */}
            {hasPermission('events') && (
              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Etkinlikler</h2>
                  <Button onClick={() => { setEditingItem(null); setEventModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Etkinlik
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {events.map(event => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={event.status === 'upcoming' ? "default" : "secondary"}>
                                {event.status === 'upcoming' ? "Yaklaşan" : "Tamamlandı"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(event, 'event')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(event.id, 'events', refetchEvents)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Henüz etkinlik bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Magazine Tab */}
            {hasPermission('magazine') && (
              <TabsContent value="magazine" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Dergi Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setMagazineModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sayı
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {magazines.map(magazine => (
                        <div key={magazine.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{magazine.title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="outline">Sayı {magazine.issue_number}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(magazine.publication_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={magazine.published ? "default" : "secondary"}>
                                {magazine.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(magazine, 'magazine')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(magazine.id, 'magazine_issues', refetchMagazines)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {magazines.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Henüz dergi sayısı bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Diğer tablar için benzer güncellemeler yapılacak... */}
          </Tabs>
        </div>

        {/* Modals */}
        <NewsModal
          isOpen={newsModalOpen}
          onClose={() => { setNewsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveNews}
          initialData={editingItem}
        />
        
        <EventModal
          isOpen={eventModalOpen}
          onClose={() => { setEventModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveEvent}
          initialData={editingItem}
        />
        
        <MagazineModal
          isOpen={magazineModalOpen}
          onClose={() => { setMagazineModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveMagazine}
          initialData={editingItem}
        />
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
