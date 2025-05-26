
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRoles, useUpdateUserRole } from '@/hooks/useSupabaseData';
import { Check, X, User } from 'lucide-react';
import { toast } from 'sonner';

const UserRoleManagement = () => {
  const { data: userRoles, isLoading } = useUserRoles();
  const updateUserRole = useUpdateUserRole();

  const approveRole = async (roleId: string) => {
    try {
      await updateUserRole.mutateAsync({
        id: roleId,
        is_approved: true,
        approved_at: new Date().toISOString(),
      });
      toast.success('Rol onaylandı');
    } catch (error) {
      console.error('Error approving role:', error);
      toast.error('Rol onaylanırken hata oluştu');
    }
  };

  const rejectRole = async (roleId: string) => {
    try {
      await updateUserRole.mutateAsync({
        id: roleId,
        is_approved: false,
      });
      toast.success('Rol reddedildi');
    } catch (error) {
      console.error('Error rejecting role:', error);
      toast.error('Rol reddedilirken hata oluştu');
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

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const pendingRoles = userRoles?.filter(role => !role.is_approved) || [];
  const approvedRoles = userRoles?.filter(role => role.is_approved) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Onay Bekleyen Roller ({pendingRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Onay bekleyen rol bulunmuyor
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {userRole.user?.name || 'Bilinmeyen Kullanıcı'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userRole.user?.email}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {getRoleDisplayName(userRole.role)}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => approveRole(userRole.id)}
                      disabled={updateUserRole.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRole(userRole.id)}
                      disabled={updateUserRole.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onaylı Roller ({approvedRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Onaylı rol bulunmuyor
            </p>
          ) : (
            <div className="space-y-3">
              {approvedRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {userRole.user?.name || 'Bilinmeyen Kullanıcı'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userRole.user?.email}
                    </div>
                    <Badge variant="default" className="mt-1">
                      {getRoleDisplayName(userRole.role)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Onaylandı: {new Date(userRole.approved_at || '').toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManagement;
