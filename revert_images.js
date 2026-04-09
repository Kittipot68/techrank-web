const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function revertImages() {
  const {data: products} = await supabase.from('products').select('*');
  console.log(`Found ${products.length} products`);
  
  let updated = 0;
  for(let p of products) {
    const rightUrl = `https://htttpzklecqdimfzcsok.supabase.co/storage/v1/object/public/images/products/${p.slug}.jpg`;
    await supabase.from('products').update({image_url: rightUrl}).eq('id', p.id);
    updated++;
  }
  
  console.log(`Reverted ${updated} items to original storage images.`);
}

revertImages();
