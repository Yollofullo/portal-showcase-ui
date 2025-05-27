import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { email, password, role } = await req.json();

  if (!['operator', 'client'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }, // Assign role during signup
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user });
}
