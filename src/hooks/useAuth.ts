
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });
};

export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_approved', true);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log('User roles found:', data);
      return data?.map(r => r.role) || [];
    },
    enabled: !!userId,
  });
};

export const useIsAdmin = (userId?: string) => {
  const { data: roles = [] } = useUserRoles(userId);
  const isAdmin = roles.includes('baskan') || roles.includes('baskan_yardimcisi');
  
  console.log('Is admin check:', { userId, roles, isAdmin });
  
  return isAdmin;
};
