import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  const supabase = createPagesServerClient({ req, res: {} as any });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.user_metadata.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const schema = z.object({
      customerId: z.string().min(1),
      orderId: z.string().min(1),
      amount: z.number().positive(),
      currency: z.string().length(3),
    });

    const { customerId, orderId, amount, currency } = schema.parse(
      await req.json()
    );

    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount,
      currency,
      description: `Invoice for Order ID: ${orderId}`,
    });

    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
    });

    return NextResponse.json({ invoiceId: invoice.id });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
