import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { User } from '../types/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function getSession() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { user } = session;
      // You may want to fetch the role from your DB or JWT
      // For demo, assume role is in user.user_metadata.role
      const role = user.user_metadata?.role || 'client';
      if (!ignore) {
        setUser({
          id: user.id,
          email: user.email || '',
          role,
        });
        setLoading(false);
      }
    }
    getSession();
    return () => { ignore = true; };
  }, []);

  return { user, loading };
}
