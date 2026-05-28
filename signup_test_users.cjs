const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'patientgy2@baobei.app',
    password: 'Password123!'
  });
  if (error) {
    console.error(`Error:`, error.message);
  } else {
    console.log(`Registered successfully.`);
  }
}
main();
