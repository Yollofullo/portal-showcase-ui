import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { sortDeliveries } from '@/lib/ai'; // Revert to alias path

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.user_metadata.role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: orders, error } = await supabase.from('orders').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Apply AI-powered sorting logic
  const sortedOrders = sortDeliveries(orders);

  return NextResponse.json(sortedOrders);
}

export async function PATCH(req: Request) {
  const supabase = createServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.user_metadata.role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status } = await req.json();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.user_metadata.role !== 'client') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { item_id, quantity } = await req.json();

  // Find an available operator
  const { data: operators, error: operatorError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'operator');

  if (operatorError || !operators || operators.length === 0) {
    return NextResponse.json(
      { error: 'No operators available' },
      { status: 500 },
    );
  }

  const assignedOperator = operators[0].id; // Assign the first available operator

  const { error } = await supabase.from('orders').insert({
    item_id,
    quantity,
    status: 'pending',
    assigned_operator: assignedOperator,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
