'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RoleChecker() {
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Checking role...");

  useEffect(() => {
    async function fetchRole() {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) return setStatus("Error fetching user");
      setRole(user?.user_metadata?.role || null);
      setStatus("");
    }
    fetchRole();
  }, []);

  return (
    <main className="p-10 max-w-xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">🔍 Your Role</h1>
        {status ? <p className="text-gray-500">{status}</p> : (
          <p className="font-semibold text-lg">
            You are a <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${role === "client" ? "text-blue-600 bg-blue-100 border-blue-300" : role === "operator" ? "text-green-600 bg-green-100 border-green-300" : "text-red-600 bg-red-100 border-red-300"}`}>{role}</span>
          </p>
        )}
      </div>
    </main>
  );
}