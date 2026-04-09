const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDb() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let success = true;

  console.log('1. Checking product_ratings table...');
  const { error: err1 } = await supabase.from('product_ratings').select('*').limit(1);
  if (err1) {
    console.error('❌ Error checking product_ratings:', err1.message);
    success = false;
  } else {
    console.log('✅ product_ratings table exists.');
  }

  console.log('\n2. Checking products.view_count column...');
  const { error: err2 } = await supabase.from('products').select('view_count').limit(1);
  if (err2) {
    console.error('❌ Error checking products.view_count:', err2.message);
    success = false;
  } else {
    console.log('✅ products.view_count column exists.');
  }

  console.log('\n3. Checking newsletter_subscribers table...');
  const { error: err3 } = await supabase.from('newsletter_subscribers').select('*').limit(1);
  if (err3) {
    console.error('❌ Error checking newsletter_subscribers:', err3.message);
    success = false;
  } else {
    console.log('✅ newsletter_subscribers table exists.');
  }

  console.log('\n4. Checking images storage bucket...');
  const { data: bucketData, error: errBucket } = await supabase.storage.getBucket('images');
  if (errBucket) {
    console.error('❌ Error checking images bucket:', errBucket.message);
    success = false;
  } else {
    console.log('✅ images bucket exists.');
  }

  if (success) {
    console.log('\n🎉 ALL CHECKS PASSED: The database is perfectly set up!');
  } else {
    console.log('\n⚠️ SOME CHECKS FAILED: Please review the errors above.');
  }
}

checkDb();
