const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});

const accounts = [
  { email: 'doctor@bstuan247.com', password: 'Password123!' },
  { email: 'letan@bstuan247.com', password: 'Password123!' },
  { email: 'patientob1@bstuan247.com', password: 'Password123!' },
  { email: 'patientgy2@bstuan247.com', password: 'Password123!' }
];

async function main() {
  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signUp(acc);
    if (error) {
      console.log(`Failed to create ${acc.email}: ${error.message}`);
    } else {
      console.log(`Created ${acc.email}`);
    }
  }
}
main();
