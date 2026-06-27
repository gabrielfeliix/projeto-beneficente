const { createClient } = require('@supabase/supabase-js');

// load env vars from .env.local
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');

let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim();
    }
  }
}

console.log('Supabase URL:', supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('\n--- Testando tabela: profiles ---');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id, name, profile_type');
  if (pError) {
    console.error('Erro ao ler profiles:', pError);
  } else {
    console.log(`Sucesso! ${profiles.length} perfis encontrados:`);
    console.log(profiles);
  }

  console.log('\n--- Testando tabela: feed_posts ---');
  const { data: posts, error: fError } = await supabase.from('feed_posts').select('*');
  if (fError) {
    console.error('Erro ao ler feed_posts:', fError);
  } else {
    console.log(`Sucesso! ${posts.length} posts no feed encontrados:`);
    console.log(posts);
  }
}

testFetch();
