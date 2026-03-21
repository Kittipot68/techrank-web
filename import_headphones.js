// import_headphones.js
require('dotenv').config({ path: 'd:/MY_FIRST_WEB/.env.local' });
const fs = require('fs');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getCategoryMap() {
    const { data } = await supabase.from('categories').select('id, slug');
    const map = {};
    if (data) {
        data.forEach(c => map[c.slug] = c.id);
    }
    return map;
}

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);
}

function generateStats() {
    const overall = (Math.random() * 3 + 7).toFixed(1); // 7.0 - 10.0
    return {
        overall_score: parseFloat(overall),
        sound_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        fps_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        comfort_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        build_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        view_count: Math.floor(Math.random() * 5000)
    };
}

async function run() {
    const catMap = await getCategoryMap();
    const HEADPHONE_CAT_ID = catMap['headphones'];
    if (!HEADPHONE_CAT_ID) {
        console.error("Headphones category not found!");
        return;
    }

    let imported = 0;
    let batch = [];
    const MAX_IMPORT = 200; // Let's import 200 headphones!

    const stream = fs.createReadStream('d:/MY_FIRST_WEB/csv/product.csv', { encoding: 'utf8' });

    Papa.parse(stream, {
        header: true,
        step: async (row, parser) => {
            if (imported >= MAX_IMPORT) {
                parser.abort();
                return;
            }

            const d = row.data;
            const fullCat = d.global_category1 + ' > ' + d.global_category2 + ' > ' + d.global_category3;

            // Look specifically for headphones
            if (fullCat === 'Audio > Earphones, Headphones & Headsets > ' && d.image_link && parseFloat(d.price) > 0 && d.title?.length > 10) {
                const slug = generateSlug(d.title) + '-' + Math.floor(Math.random() * 100000);
                const stats = generateStats();

                batch.push({
                    category_id: HEADPHONE_CAT_ID,
                    name: d.title.substring(0, 200),
                    slug: slug,
                    price_min: parseFloat(d.price),
                    price_max: d.sale_price ? parseFloat(d.sale_price) : parseFloat(d.price),
                    image_url: d.image_link.startsWith('http') ? d.image_link : 'https://cf.shopee.co.th/file/' + d.image_link,
                    affiliate_url: d.product_link,
                    pros: ['ยอดจัดจำหน่าย: ' + (d.item_sold || 0), 'แบรนด์: ' + (d.global_brand || 'ทั่วไป')],
                    cons: ['คะแนนจากผู้ขาย: ' + (d.shop_rating || 'N/A')],
                    ...stats
                });

                imported++;
                if (imported % 50 === 0) {
                    console.log(`Prepared ${imported} headphones...`);
                }
            }
        },
        complete: async () => {
            console.log(`Scan complete. Found ${batch.length} headphones.`);

            if (batch.length > 0) {
                console.log("Inserting batch to Supabase...");
                // Insert in chunks of 50 to avoid payload size errors
                for (let i = 0; i < batch.length; i += 50) {
                    const chunk = batch.slice(i, i + 50);
                    const { data, error } = await supabase.from('products').insert(chunk).select();

                    if (error) {
                        console.error(`Error inserting chunk ${i}:`, error);
                    } else {
                        console.log(`✅ Chunk inserted: ${data.length} products`);
                        const specs = [];
                        data.forEach(p => {
                            specs.push({ product_id: p.id, key: 'Brand', value: 'Shopee Import' });
                            specs.push({ product_id: p.id, key: 'Type', value: 'Headphones/Earphones' });
                        });
                        await supabase.from('specs').insert(specs);
                    }
                }
                console.log(`✅ All ${batch.length} headphones imported successfully!`);
            }
        }
    });
}

run();
