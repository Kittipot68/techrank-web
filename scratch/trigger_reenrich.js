const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resetAndFix() {
    console.log("♻️  Resetting TCL TV to trigger enhanced re-enrichment...");
    await supabase.from('products').update({
        pros: null,
        description: "TechRank: Re-enriching with upgraded specs..."
    }).eq('name', '[ติดตั้งฟรี]TCL Premium QD Mini LED TV 98 นิ้ว รุ่น 98T8D 4K 144Hz HDR10+ Dolby Vision | VRR Freesync | ลำโพง ONKYO');
    
    console.log("✅ Reset done. Run 'node elite_scraper.js' now.");
}

resetAndFix();
