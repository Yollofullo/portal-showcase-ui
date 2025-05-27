'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthDebug() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('Auth Debug - getUser()', { data, error });
      if (data?.user) setUser(data.user);
    });
  }, []);

  return (
    <div className="mt-6 p-4 border rounded bg-gray-100 text-sm">
      <strong>Debug User Info:</strong>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}