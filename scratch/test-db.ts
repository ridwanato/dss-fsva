import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jysbofcwnctpzhksxrqe.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('fsva_map_view').select('*').limit(1);
  console.log(error, Object.keys(data?.[0] || {}));
}
run();
