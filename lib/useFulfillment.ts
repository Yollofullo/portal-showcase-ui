import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useFulfillment() {
  return useQuery({
    queryKey: ['fulfillment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fulfillment').select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
}
