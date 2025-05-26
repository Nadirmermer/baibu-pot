
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
  Edit,
  Trash2,
  Plus,
  Building2,
  ClipboardList,
  GraduationCap,
  Eye,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NewsModal from '@/components/admin/NewsModal';
import EventModal from '@/components/admin/EventModal';
import MagazineModal from '@/components/admin/MagazineModal';
import SponsorModal from '@/components/admin/SponsorModal';
import SurveyModal from '@/components/admin/SurveyModal';
import TeamMemberModal from '@/components/admin/TeamMemberModal';
import UserRoleManagement from '@/components/admin/UserRoleManagement';
import { useNews, useEvents, useMagazineIssues, useSurveys, useSponsors, useTeamMembers, useAcademicDocuments, useInternships, useContactMessages, useUsers, useUserRoles } from '@/hooks/useSupabaseData';

interface User {
  id: string;
  email: string;
  name?: string;
  userRoles?: string[]; // Changed from single role to array of roles
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [magazineModalOpen, setMagazineModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [teamMemberModalOpen, setTeamMemberModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data hooks
  const { data: users } = useUsers();
  const { data: userRoles } = useUserRoles();
  const { data: news } = useNews(false);
  const { data: events } = useEvents();
  const { data: magazines } = useMagazineIssues(false);
  const { data: surveys } = useSurveys();
  const { data: internships } = useInternships(false);
  const { data: documents } = useAcademicDocuments();
  const { data: contactMessages } = useContactMessages();
  const { data: sponsors } = useSponsors(false);
  const { data: teamMembers } = useTeamMembers(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/admin');
      return;
    }

    // Get user profile and roles
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .eq('is_approved', true);

    if (userProfile) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile.name || authUser.user_metadata?.name,
        userRoles: userRoleData?.map(r => r.role) || []
      });
    } else {
      // Fallback for users without profile
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name,
        userRoles: ['baskan'] // Default role for fallback
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getRolePermissions = (roles: string[]) => {
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
    
    // Combine permissions from all user roles
    const allPermissions = new Set<string>();
    roles.forEach(role => {
      const rolePermissions = permissions[role as keyof typeof permissions] || [];
      rolePermissions.forEach(perm => allPermissions.add(perm));
    });
    
    return Array.from(allPermissions);
  };

  const hasPermission = (permission: string) => {
    if (!user || !user.userRoles) return false;
    return getRolePermissions(user.userRoles).includes(permission);
  };

  const getRoleLabel = (roles: string[]) => {
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
    return roles.map(role => roleLabels[role as keyof typeof roleLabels] || role).join(', ');
  };

  const handleSaveNews = async (newsData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Haber güncellendi');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([{ ...newsData, author_id: user?.id }]);
        if (error) throw error;
        toast.success('Haber eklendi');
      }
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
          .insert([{ ...eventData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Etkinlik eklendi');
      }
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
          .insert([{ ...magazineData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Dergi eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving magazine:', error);
    }
  };

  const handleSaveSponsor = async (sponsorData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Sponsor güncellendi');
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert([sponsorData]);
        if (error) throw error;
        toast.success('Sponsor eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving sponsor:', error);
    }
  };

  const handleSaveSurvey = async (surveyData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Anket güncellendi');
      } else {
        const { error } = await supabase
          .from('surveys')
          .insert([{ ...surveyData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Anket eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving survey:', error);
    }
  };

  const handleSaveTeamMember = async (teamMemberData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('team_members')
          .update(teamMemberData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Ekip üyesi güncellendi');
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert([teamMemberData]);
        if (error) throw error;
        toast.success('Ekip üyesi eklendi');
      }
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving team member:', error);
    }
  };

  const openEditModal = (item: any, type: 'news' | 'event' | 'magazine' | 'sponsor' | 'survey' | 'team') => {
    setEditingItem(item);
    if (type === 'news') setNewsModalOpen(true);
    else if (type === 'event') setEventModalOpen(true);
    else if (type === 'magazine') setMagazineModalOpen(true);
    else if (type === 'sponsor') setSponsorModalOpen(true);
    else if (type === 'survey') setSurveyModalOpen(true);
    else if (type === 'team') setTeamMemberModalOpen(true);
  };

  const handleDelete = async (
    id: string, 
    tableName: 'news' | 'events' | 'magazine_issues' | 'sponsors' | 'surveys' | 'team_members'
  ) => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Öğe silindi');
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting:', error);
    }
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  const getPendingCount = (category: string) => {
    switch (category) {
      case 'news':
        return news?.filter(item => !item.published).length || 0;
      case 'magazines':
        return magazines?.filter(item => !item.published).length || 0;
      case 'users':
        return userRoles?.filter(role => !role.is_approved).length || 0;
      case 'contact':
        return contactMessages?.filter(msg => msg.status === 'unread').length || 0;
      default:
        return 0;
    }
  };

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: users?.length || 0,
      change: '+2',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Bekleyen Roller',
      value: getPendingCount('users'),
      change: `${getPendingCount('users')} beklemede`,
      icon: Shield,
      color: 'text-amber-600'
    },
    {
      title: 'Toplam Haberler',
      value: news?.length || 0,
      change: '+2',
      icon: FileText,
      color: 'text-cyan-600'
    },
    {
      title: 'Toplam Etkinlikler',
      value: events?.length || 0,
      change: '+2',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Toplam Dergi Sayıları',
      value: magazines?.length || 0,
      change: '+2',
      icon: BookOpen,
      color: 'text-yellow-600'
    },
    {
      title: 'Toplam Anketler',
      value: surveys?.length || 0,
      change: '+2',
      icon: ClipboardList,
      color: 'text-purple-600'
    },
    {
      title: 'Toplam Sponsorlar',
      value: sponsors?.length || 0,
      change: '+2',
      icon: Building2,
      color: 'text-pink-600'
    },
    {
      title: 'Toplam Ekipler',
      value: teamMembers?.length || 0,
      change: '+2',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Toplam Belgeler',
      value: documents?.length || 0,
      change: '+2',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      title: 'Toplam Staj İlanları',
      value: internships?.length || 0,
      change: '+2',
      icon: Briefcase,
      color: 'text-yellow-600'
    },
    {
      title: 'Toplam Mesajlar',
      value: contactMessages?.length || 0,
      change: '+2',
      icon: MessageSquare,
      color: 'text-blue-600'
    }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
              <div className="flex items-center mb-4 sm:mb-0">
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
                    {getRoleLabel(user.userRoles || [])}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Çıkış</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Responsive tab list */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-max grid-flow-col gap-1 md:w-full md:grid-cols-5 lg:grid-cols-11">
                <TabsTrigger value="overview" className="text-xs whitespace-nowrap">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Genel
                </TabsTrigger>
                {hasPermission('users') && (
                  <TabsTrigger value="users" className="text-xs whitespace-nowrap">
                    <Shield className="h-4 w-4 mr-1" />
                    Roller
                  </TabsTrigger>
                )}
                {hasPermission('news') && (
                  <TabsTrigger value="news" className="text-xs whitespace-nowrap">
                    <FileText className="h-4 w-4 mr-1" />
                    Haberler
                  </TabsTrigger>
                )}
                {hasPermission('events') && (
                  <TabsTrigger value="events" className="text-xs whitespace-nowrap">
                    <Calendar className="h-4 w-4 mr-1" />
                    Etkinlikler
                  </TabsTrigger>
                )}
                {hasPermission('magazine') && (
                  <TabsTrigger value="magazine" className="text-xs whitespace-nowrap">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Dergi
                  </TabsTrigger>
                )}
                {hasPermission('surveys') && (
                  <TabsTrigger value="surveys" className="text-xs whitespace-nowrap">
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Anketler
                  </TabsTrigger>
                )}
                {hasPermission('sponsors') && (
                  <TabsTrigger value="sponsors" className="text-xs whitespace-nowrap">
                    <Building2 className="h-4 w-4 mr-1" />
                    Sponsorlar
                  </TabsTrigger>
                )}
                {hasPermission('team') && (
                  <TabsTrigger value="team" className="text-xs whitespace-nowrap">
                    <Users className="h-4 w-4 mr-1" />
                    Ekipler
                  </TabsTrigger>
                )}
                {hasPermission('documents') && (
                  <TabsTrigger value="documents" className="text-xs whitespace-nowrap">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Belgeler
                  </TabsTrigger>
                )}
                {hasPermission('internships') && (
                  <TabsTrigger value="internships" className="text-xs whitespace-nowrap">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Staj
                  </TabsTrigger>
                )}
                {hasPermission('messages') && (
                  <TabsTrigger value="messages" className="text-xs whitespace-nowrap">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Mesajlar
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Dashboard Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Haberler</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{news?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {news?.filter(n => n.published).length || 0} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Etkinlikler</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{events?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {events?.filter(e => e.status === 'upcoming').length || 0} yaklaşan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dergi Sayıları</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{magazines?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {magazines?.filter(m => m.published).length || 0} yayında
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contactMessages?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {contactMessages?.filter(m => m.status === 'unread').length || 0} okunmamış
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            {hasPermission('users') && (
              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Rol Yönetimi</h2>
                </div>
                <UserRoleManagement />
              </TabsContent>
            )}

            {/* News Tab */}
            {hasPermission('news') && (
              <TabsContent value="news" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Haberler ve Duyurular</h2>
                  <Button onClick={() => { setEditingItem(null); setNewsModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Haber
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {news?.map(newsItem => (
                        <div key={newsItem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{newsItem.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{newsItem.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(newsItem.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={newsItem.published ? "default" : "secondary"}>
                                {newsItem.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(newsItem, 'news')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(newsItem.id, 'news')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!news || news?.length === 0) && (
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Etkinlikler</h2>
                  <Button onClick={() => { setEditingItem(null); setEventModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Etkinlik
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {events?.map(event => (
                        <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={event.status === 'upcoming' ? "default" : "secondary"}>
                                {event.status === 'upcoming' ? "Yaklaşan" : "Tamamlandı"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(event, 'event')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(event.id, 'events')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!events || events?.length === 0) && (
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Dergi Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setMagazineModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sayı
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {magazines?.map(magazine => (
                        <div key={magazine.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{magazine.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">Sayı {magazine.issue_number}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(magazine.publication_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={magazine.published ? "default" : "secondary"}>
                                {magazine.published ? "Yayında" : "Taslak"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(magazine, 'magazine')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(magazine.id, 'magazine_issues')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!magazines || magazines?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz dergi sayısı bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Surveys Tab */}
            {hasPermission('surveys') && (
              <TabsContent value="surveys" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Anket Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setSurveyModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Anket
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {surveys?.map(survey => (
                        <div key={survey.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{survey.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(survey.start_date).toLocaleDateString('tr-TR')} - {new Date(survey.end_date).toLocaleDateString('tr-TR')}
                              </span>
                              <Badge variant={survey.active ? "default" : "secondary"}>
                                {survey.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(survey, 'survey')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(survey.id, 'surveys')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!surveys || surveys?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz anket bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Sponsors Tab */}
            {hasPermission('sponsors') && (
              <TabsContent value="sponsors" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Sponsor Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setSponsorModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Sponsor
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {sponsors?.map(sponsor => (
                        <div key={sponsor.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{sponsor.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{sponsor.sponsor_type}</Badge>
                              <Badge variant={sponsor.active ? "default" : "secondary"}>
                                {sponsor.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(sponsor, 'sponsor')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(sponsor.id, 'sponsors')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!sponsors || sponsors?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz sponsor bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Team Tab */}
            {hasPermission('team') && (
              <TabsContent value="team" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Ekip Yönetimi</h2>
                  <Button onClick={() => { setEditingItem(null); setTeamMemberModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Üye
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {teamMembers?.map(member => (
                        <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{member.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{member.team}</Badge>
                              <span className="text-sm text-muted-foreground">{member.role}</span>
                              <Badge variant={member.active ? "default" : "secondary"}>
                                {member.active ? "Aktif" : "Pasif"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(member, 'team')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(member.id, 'team_members')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!teamMembers || teamMembers?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz ekip üyesi bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Documents Tab */}
            {hasPermission('documents') && (
              <TabsContent value="documents" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Akademik Belgeler</h2>
                  <Button onClick={() => toast.info('Belge ekleme modalı henüz hazır değil')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Belge
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {documents?.map(doc => (
                        <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{doc.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {doc.downloads} indirme
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!documents || documents?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz belge bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Internships Tab */}
            {hasPermission('internships') && (
              <TabsContent value="internships" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">Staj İlanları</h2>
                  <Button onClick={() => toast.info('Staj ekleme modalı henüz hazır değil')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Staj İlanı
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {internships?.map(internship => (
                        <div key={internship.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{internship.position}</h3>
                            <p className="text-sm text-muted-foreground">{internship.company_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{internship.location}</Badge>
                              <Badge variant={internship.active ? "default" : "secondary"}>
                                {internship.active ? "Aktif" : "Pasif"}
                              </Badge>
                              {internship.application_deadline && (
                                <span className="text-sm text-muted-foreground">
                                  Son Başvuru: {new Date(internship.application_deadline).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!internships || internships?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz staj ilanı bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Messages Tab */}
            {hasPermission('messages') && (
              <TabsContent value="messages" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold">İletişim Mesajları</h2>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {contactMessages?.map(message => (
                        <div key={message.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{message.subject}</h3>
                            <p className="text-sm text-muted-foreground">{message.name} - {message.email}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {message.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant={message.status === 'unread' ? "default" : "secondary"}>
                                {message.status === 'unread' ? "Okunmadı" : "Okundu"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!contactMessages || contactMessages?.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">Henüz mesaj bulunmuyor</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
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

        <SponsorModal
          isOpen={sponsorModalOpen}
          onClose={() => { setSponsorModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveSponsor}
          initialData={editingItem}
        />

        <SurveyModal
          isOpen={surveyModalOpen}
          onClose={() => { setSurveyModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveSurvey}
          initialData={editingItem}
        />

        <TeamMemberModal
          isOpen={teamMemberModalOpen}
          onClose={() => { setTeamMemberModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveTeamMember}
          initialData={editingItem}
        />
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
