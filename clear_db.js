const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("Clearing all products and related data...");
    
    // We target all products where id is not null (which is all of them)
    // The ON DELETE CASCADE constraint will automatically wipe specs, views, and ratings too
    const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); 
        
    if (error) {
        console.error("Error deleting data:", error.message);
    } else {
        console.log("✅ All product data has been wiped spotlessly clean!");
    }
}

run();
