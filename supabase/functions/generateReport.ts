// @ts-ignore: Deno runtime-specific imports
// deno-lint-ignore-file

// @ts-ignore: Deno runtime-specific imports
import { serve } from 'https://deno.land/x/sift@0.5.0/mod.ts';
// @ts-ignore: Deno runtime-specific imports
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';

// @ts-ignore: Deno-specific global object
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
// @ts-ignore: Deno-specific global object
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { operatorId } = await req.json();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('assigned_operator', operatorId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ report: data }), { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    return new Response(
      JSON.stringify({ error: 'An unknown error occurred' }),
      { status: 500 },
    );
  }
});
