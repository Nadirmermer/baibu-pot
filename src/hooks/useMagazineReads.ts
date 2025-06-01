
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMagazineReads = (magazineId: string) => {
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!magazineId) return;

    const fetchReadCount = async () => {
      try {
        // Get current read count from magazine_issues table
        const { data, error } = await supabase
          .from('magazine_issues')
          .select('read_count')
          .eq('id', magazineId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching read count:', error);
          return;
        }

        setReadCount(data?.read_count || 0);
      } catch (error) {
        console.error('Error fetching read count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadCount();
  }, [magazineId]);

  const incrementReadCount = async () => {
    try {
      // Update read count in magazine_issues table
      const { data, error } = await supabase
        .from('magazine_issues')
        .update({
          read_count: readCount + 1
        })
        .eq('id', magazineId)
        .select()
        .single();

      if (error) {
        console.error('Error updating read count:', error);
        return;
      }

      setReadCount(data.read_count);
    } catch (error) {
      console.error('Error incrementing read count:', error);
    }
  };

  return { readCount, loading, incrementReadCount };
};

export const useAllMagazineReads = () => {
  const [reads, setReads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReads = async () => {
      try {
        const { data, error } = await supabase
          .from('magazine_issues')
          .select('id, title, issue_number, read_count, updated_at')
          .not('read_count', 'is', null)
          .order('read_count', { ascending: false });

        if (error) {
          console.error('Error fetching all reads:', error);
          return;
        }

        setReads(data || []);
      } catch (error) {
        console.error('Error fetching all reads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReads();
  }, []);

  return { reads, loading };
};
