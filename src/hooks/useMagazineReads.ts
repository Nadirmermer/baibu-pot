
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMagazineReads = (magazineId: string) => {
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!magazineId) return;

    const fetchReadCount = async () => {
      try {
        // Get current read count
        const { data, error } = await supabase
          .from('magazine_reads')
          .select('read_count')
          .eq('magazine_id', magazineId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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
      // First try to update existing record
      const { data, error } = await supabase
        .from('magazine_reads')
        .upsert({
          magazine_id: magazineId,
          read_count: readCount + 1,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'magazine_id'
        })
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
          .from('magazine_reads')
          .select(`
            magazine_id,
            read_count,
            last_read_at,
            magazine_issues(
              title,
              issue_number
            )
          `)
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
