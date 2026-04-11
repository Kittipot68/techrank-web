const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function purgeDuplicates() {
    console.log("🧹 TECHRANK DATABASE CLEANUP: DE-DUPLICATION");
    console.log("==========================================");

    // 1. Fetch all products to analyze Shopee IDs
    const { data: products, error } = await supabase.from('products').select('id, name, affiliate_url, price_min, image_url, description');
    if (error) {
        console.error("❌ Error fetching products:", error.message);
        return;
    }

    const itemGroups = new Map();
    const nameGroups = new Map();

    products.forEach(p => {
        // Normalize name: lowercase, trim, remove excessive non-alphanumeric at ends
        const normName = p.name?.toLowerCase().replace(/[^\w\sก-ฮ]/g, '').replace(/\s+/g, ' ').trim();
        if (normName) {
            if (!nameGroups.has(normName)) nameGroups.set(normName, []);
            nameGroups.get(normName).push(p);
        }

        // Extract itemId from URL (fallback/primary)
        const match = p.affiliate_url?.match(/\/(\d+)\/(\d+)/);
        if (match) {
            const itemId = match[2];
            if (!itemGroups.has(itemId)) itemGroups.set(itemId, []);
            itemGroups.get(itemId).push(p);
        }
    });

    let totalDeleted = 0;
    const deletedIds = new Set();

    // Deduplicate by Name first (strongest indicator of same product)
    for (const [name, group] of nameGroups.entries()) {
        if (group.length > 1) {
            const sorted = group.sort((a, b) => {
                const aScore = (a.price_min ? 10 : 0) + (a.image_url ? 5 : 0) + (a.description?.length > 100 ? 5 : 0);
                const bScore = (b.price_min ? 10 : 0) + (b.image_url ? 5 : 0) + (b.description?.length > 100 ? 5 : 0);
                return bScore - aScore;
            });

            const winners = [sorted[0]];
            const losers = sorted.slice(1);

            for (const loser of losers) {
                if (deletedIds.has(loser.id)) continue;
                console.log(`   🗑️  Deleting Name Duplicate: "${loser.name}" (ID ${loser.id})`);
                await supabase.from('specs').delete().eq('product_id', loser.id);
                await supabase.from('products').delete().eq('id', loser.id);
                deletedIds.add(loser.id);
                totalDeleted++;
            }
        }
    }

    // Deduplicate by Shopee IDs for anything that missed Name match
    for (const [itemId, group] of itemGroups.entries()) {
        const remainingInGroup = group.filter(p => !deletedIds.has(p.id));
        if (remainingInGroup.length > 1) {
            const sorted = remainingInGroup.sort((a, b) => {
                const aScore = (a.price_min ? 10 : 0) + (a.image_url ? 5 : 0) + (a.description?.length > 100 ? 5 : 0);
                const bScore = (b.price_min ? 10 : 0) + (b.image_url ? 5 : 0) + (b.description?.length > 100 ? 5 : 0);
                return bScore - aScore;
            });

            const losers = sorted.slice(1);
            for (const loser of losers) {
                console.log(`   🗑️  Deleting ID Duplicate: ${loser.id} (Item ${itemId})`);
                await supabase.from('specs').delete().eq('product_id', loser.id);
                await supabase.from('products').delete().eq('id', loser.id);
                deletedIds.add(loser.id);
                totalDeleted++;
            }
        }
    }

    console.log("\n==========================================");
    console.log(`🎉 CLEANUP COMPLETE! Deleted ${totalDeleted} duplicates.`);
    console.log("==========================================");
}

purgeDuplicates();
