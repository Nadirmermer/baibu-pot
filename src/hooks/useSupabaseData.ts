
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

// Users hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

// User roles hooks
export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          users:user_id(name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleData: Tables['user_roles']['Insert']) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([roleData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['user_roles']['Update']) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
};

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

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newsData: Tables['news']['Insert']) => {
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['news']['Update']) => {
      const { data, error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
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

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: Tables['events']['Insert']) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['events']['Update']) => {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Form fields hooks
export const useFormFields = (formId: string, formType: string) => {
  return useQuery({
    queryKey: ['form_fields', formId, formType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .eq('form_type', formType)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFormField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fieldData: Tables['form_fields']['Insert']) => {
      const { data, error } = await supabase
        .from('form_fields')
        .insert([fieldData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_fields', variables.form_id, variables.form_type] 
      });
    },
  });
};

// Form responses hooks
export const useFormResponses = (formId: string, formType: string) => {
  return useQuery({
    queryKey: ['form_responses', formId, formType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .eq('form_type', formType)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFormResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (responseData: Tables['form_responses']['Insert']) => {
      const { data, error } = await supabase
        .from('form_responses')
        .insert([responseData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['form_responses', variables.form_id, variables.form_type] 
      });
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

export const useCreateMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (magazineData: Tables['magazine_issues']['Insert']) => {
      const { data, error } = await supabase
        .from('magazine_issues')
        .insert([magazineData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
    },
  });
};

export const useUpdateMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['magazine_issues']['Update']) => {
      const { data, error } = await supabase
        .from('magazine_issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
    },
  });
};

export const useDeleteMagazine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('magazine_issues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_issues'] });
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

export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sponsorData: Tables['sponsors']['Insert']) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert([sponsorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useUpdateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['sponsors']['Update']) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
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
        .order('year', { ascending: false })
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

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamMemberData: Tables['team_members']['Insert']) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert([teamMemberData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['team_members']['Update']) => {
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
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

export const useCreateAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentData: Tables['academic_documents']['Insert']) => {
      const { data, error } = await supabase
        .from('academic_documents')
        .insert([documentData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

export const useUpdateAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['academic_documents']['Update']) => {
      const { data, error } = await supabase
        .from('academic_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
    },
  });
};

export const useDeleteAcademicDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_documents'] });
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

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (internshipData: Tables['internships']['Insert']) => {
      const { data, error } = await supabase
        .from('internships')
        .insert([internshipData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['internships']['Update']) => {
      const { data, error } = await supabase
        .from('internships')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useDeleteInternship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
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

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (surveyData: Tables['surveys']['Insert']) => {
      const { data, error } = await supabase
        .from('surveys')
        .insert([surveyData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Tables['surveys']['Update']) => {
      const { data, error } = await supabase
        .from('surveys')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
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
