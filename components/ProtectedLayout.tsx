'use client';
import React from 'react';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/router';

interface ProtectedLayoutProps {
  roles: string[];
  children: React.ReactNode;
}

export default function ProtectedLayout({ roles, children }: ProtectedLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !roles.includes(user.role))) {
      router.replace('/unauthorized');
    }
  }, [user, loading, roles, router]);

  if (loading || !user) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (!roles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}
