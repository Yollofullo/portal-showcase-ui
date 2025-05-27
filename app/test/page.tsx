'use client';

import React from 'react'; // Add React import for JSX
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  useEffect(() => {
    async function fetchSession() {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        console.log('Session data:', session);
      }
    }

    fetchSession();
  }, []);

  return <div>Test Page</div>;
}
