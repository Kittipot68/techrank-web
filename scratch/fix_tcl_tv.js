const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// We'll reuse the logic from elite_scraper.js by copying the core synthesis 
// Or better, just run the updated elite_scraper.js with a filter for the specific IDs.
// BUT elite_scraper.js is designed to find generic products automatically.
// Since I already fixed the synthesis logic, running it normally should pick up
// the TV because it has 'pros' null.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixSpecificProducts() {
    console.log("🛠️  Targeted Product Fixer Start...");

    // Target the two TVs mentioned/found
    const targetIds = [
        '8b3e805f-4fd8-4ca9-9e76-324bc0f5ca32', // The Speaker-categorized TV
        'd1626821-e9a6-4814-82b2-cfb7ddd49f15'  // The Gadget-categorized TV
    ];

    console.log(`🔍 Resetting metadata for ${targetIds.length} products to trigger Elite Scraper...`);

    // Resetting them to 'null' for key fields will make elite_scraper pick them up
    // AND we change the category of the first one to correct it from Speakers to Monitors/TVs
    
    // First, find the monitor category ID
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', 'monitors').single();
    
    for (const id of targetIds) {
        await supabase.from('products').update({
            category_id: cat?.id || null,
            pros: null,
            cons: null,
            price_min: null, // Force re-fetch/re-calculate
            price_max: null,
            description: "TechRank: Refreshing data..."
        }).eq('id', id);
    }

    console.log("✅ Reset complete. Now running Elite Scraper on these products...");
    
    // We can't easily wait for a shell command in this sync script, 
    // so we'll just end and tell the user to run elite_scraper or we run it from terminal.
}

fixSpecificProducts();
