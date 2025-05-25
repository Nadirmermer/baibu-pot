
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// News hooks
export const useNews = (published = true) => {
  return useQuery({
    queryKey: ['news', published],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (published) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useNewsById = (id: string) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

// Events hooks
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useEventById = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

// Magazine hooks
export const useMagazineIssues = (published = true) => {
  return useQuery({
    queryKey: ['magazine_issues', published],
    queryFn: async () => {
      let query = supabase
        .from('magazine_issues')
        .select('*')
        .order('issue_number', { ascending: false });
      
      if (published) {
        query = query.eq('published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useMagazineById = (id: string) => {
  return useQuery({
    queryKey: ['magazine_issues', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magazine_issues')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

// Sponsors hooks
export const useSponsors = (active = true) => {
  return useQuery({
    queryKey: ['sponsors', active],
    queryFn: async () => {
      let query = supabase
        .from('sponsors')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (active) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Team members hooks
export const useTeamMembers = (active = true) => {
  return useQuery({
    queryKey: ['team_members', active],
    queryFn: async () => {
      let query = supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (active) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Academic documents hooks
export const useAcademicDocuments = () => {
  return useQuery({
    queryKey: ['academic_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// Internships hooks
export const useInternships = (active = true) => {
  return useQuery({
    queryKey: ['internships', active],
    queryFn: async () => {
      let query = supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (active) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Surveys hooks
export const useSurveys = (active?: boolean) => {
  return useQuery({
    queryKey: ['surveys', active],
    queryFn: async () => {
      let query = supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (typeof active === 'boolean') {
        query = query.eq('active', active);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Contact messages hooks
export const useContactMessages = () => {
  return useQuery({
    queryKey: ['contact_messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// Contact message mutation
export const useCreateContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Tables['contact_messages']['Insert']) => {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([message])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
    },
  });
};

// Comments hooks
export const useComments = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: Tables['comments']['Insert']) => {
      const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.entity_type, variables.entity_id] 
      });
    },
  });
};
