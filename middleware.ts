import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // Redirect to login if no session
  if (!session) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const userRole = session.user?.user_metadata?.role;

  // Redirect if role is missing
  if (!userRole) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const routeRoles = [
    { path: '/admin', role: 'admin' },
    { path: '/portal', role: 'client' },
    { path: '/operator', role: 'operator' },
    { path: '/client', role: 'client' },
  ];

  for (const { path, role } of routeRoles) {
    if (req.nextUrl.pathname.startsWith(path) && userRole !== role) {
      url.pathname = '/access-denied';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/operator/:path*', '/client/:path*'],
};
