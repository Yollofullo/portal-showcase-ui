'use client';

import React from 'react'; // Add React import for JSX
import { supabase } from '@/lib/supabase';

export default function ClientLoginPage() {
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
    if (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleSignIn}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Client Login with GitHub
      </button>
    </div>
  );
}
