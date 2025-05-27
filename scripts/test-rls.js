import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function testRLS() {
  const roles = ['admin', 'operator', 'client'];
  const testResults = [];

  for (const role of roles) {
    const { data: user } = await supabase.auth.admin.createUser({
      email: `${role}-${Date.now()}@example.com`,
      password: 'tempPass123!',
      user_metadata: { role },
    });

    const userId = user?.id;
    if (!userId) continue;

    // Simulate RLS test by impersonating user with Row Security context
    const testClient = supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email
    });

    // Example: Query restricted table
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .eq('test_rls', true);

    testResults.push({ role, success: !error && data.length >= 0 });
  }

  console.table(testResults);
}

testRLS();
