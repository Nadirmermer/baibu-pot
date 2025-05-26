
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCreateUserRole } from '@/hooks/useSupabaseData';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('teknik_ekip');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createUserRole = useCreateUserRole();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Giriş başarılı!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Önce kullanıcıyı Supabase Auth'a kaydet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Kullanıcıyı users tablosuna ekle
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email!,
              name: name,
            }
          ]);

        if (userError && !userError.message.includes('duplicate key')) {
          console.error('User creation error:', userError);
        }

        // Seçilen rolü ekle (onay bekleyecek)
        try {
          await createUserRole.mutateAsync({
            user_id: authData.user.id,
            role: selectedRole,
            is_approved: false
          });
        } catch (roleError) {
          console.error('Role creation error:', roleError);
        }

        toast.success('Kayıt başarılı! E-posta adresinizi doğrulayın ve rol onayını bekleyin.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'baskan': 'Başkan',
      'baskan_yardimcisi': 'Başkan Yardımcısı',
      'teknik_koordinator': 'Teknik Koordinatör',
      'teknik_ekip': 'Teknik Ekip',
      'etkinlik_koordinator': 'Etkinlik Koordinatör',
      'etkinlik_ekip': 'Etkinlik Ekip',
      'iletisim_koordinator': 'İletişim Koordinatör',
      'iletisim_ekip': 'İletişim Ekip',
      'dergi_koordinator': 'Dergi Koordinatör',
      'dergi_ekip': 'Dergi Ekip',
    };
    return roleNames[role] || role;
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Admin Paneli
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Yönetim paneline erişim için giriş yapın
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      'Giriş yapılıyor...'
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Giriş Yap
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Ad Soyad</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ad Soyad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol Seçin</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baskan">Başkan</SelectItem>
                        <SelectItem value="baskan_yardimcisi">Başkan Yardımcısı</SelectItem>
                        <SelectItem value="teknik_koordinator">Teknik Koordinatör</SelectItem>
                        <SelectItem value="teknik_ekip">Teknik Ekip</SelectItem>
                        <SelectItem value="etkinlik_koordinator">Etkinlik Koordinatör</SelectItem>
                        <SelectItem value="etkinlik_ekip">Etkinlik Ekip</SelectItem>
                        <SelectItem value="iletisim_koordinator">İletişim Koordinatör</SelectItem>
                        <SelectItem value="iletisim_ekip">İletişim Ekip</SelectItem>
                        <SelectItem value="dergi_koordinator">Dergi Koordinatör</SelectItem>
                        <SelectItem value="dergi_ekip">Dergi Ekip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      'Kayıt oluşturuluyor...'
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Kayıt Ol
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    Kayıt olduktan sonra seçtiğiniz rol için admin onayı gereklidir.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
};

export default AdminLogin;
