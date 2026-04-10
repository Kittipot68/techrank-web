const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Define category logic based on product name keywords
const CATEGORY_MAP = [
  { slug: 'headphones', keywords: ['หูฟัง', 'Headphones', 'Earphones', 'Earbuds', 'Airpods', 'In-ear'] },
  { slug: 'speakers', keywords: ['ลำโพง', 'Speaker', 'Soundbar'] },
  { slug: 'keyboards', keywords: ['คีย์บอร์ด', 'Keyboard'] },
  { slug: 'mice', keywords: ['เมาส์', 'Mouse', 'Trackpad'] },
  { slug: 'monitors', keywords: ['จอ', 'Monitor', 'Screen'] },
  { slug: 'smartwatches', keywords: ['นาฬิกา', 'Watch', 'Band', 'Fitness Tracker'] },
  { slug: 'smartphones', keywords: ['มือถือ', 'โทรศัพท์', 'Smartphone', 'Phone', 'iPhone', 'Redmi', 'POCO', 'Samsung'] },
  { slug: 'tablets', keywords: ['แท็บเล็ต', 'Tablet', 'iPad', 'Pad'] },
  { slug: 'laptops', keywords: ['โน๊ตบุ๊ค', 'Notebook', 'Laptop', 'Macbook'] },
  { slug: 'smart-home', keywords: ['เครื่องฟอกอากาศ', 'กล้องวงจรปิด', 'Security', 'Purifier', 'Pet Fountain', 'Robot Vacuum', 'หุ่นยนต์กวาด'] },
  { slug: 'appliances', keywords: ['ไดร์เป่าผม', 'กาต้มน้ำ', 'Kettle', 'Dryer', 'Shaver', 'โกนหนวด', 'Vacuum', 'เครื่องดูดฝุ่น'] },
  { slug: 'gadgets', keywords: ['Powerbank', 'Battery', 'ชาร์จ', 'Charger', 'Adapter', 'สายชาร์จ'] }
];

function guessCategory(name) {
  for (const cat of CATEGORY_MAP) {
    if (cat.keywords.some(k => name.toLowerCase().includes(k.toLowerCase()))) {
      return cat.slug;
    }
  }
  return 'gadgets'; // Fallback
}

function parseCSVLine(line) {
  // Simple CSV parser for Shopee format (handles some commas in quotes)
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9 -]/g, '') // Keep Thai and Alphanum
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function run() {
  console.log("🚀 Starting SMART Mass Import...");

  // 1. Ensure all categories exist
  const uniqueSlugs = CATEGORY_MAP.map(c => c.slug);
  const { data: existingCats } = await supabase.from('categories').select('id, slug');
  const catCache = {};
  existingCats?.forEach(c => catCache[c.slug] = c.id);

  for (const slug of uniqueSlugs) {
    if (!catCache[slug]) {
      const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const { data: newCat, error } = await supabase.from('categories').insert({ name, slug }).select('id').single();
      if (!error && newCat) {
        catCache[slug] = newCat.id;
        console.log(`✨ Created category: ${name}`);
      }
    }
  }

  // 2. Load all CSVs
  const dataDir = path.join(process.cwd(), 'DATA');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  const products = new Map(); // Use map to de-duplicate by ID

  console.log(`📂 Scanning ${files.length} CSV files...`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const lines = content.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i].trim());
      if (row.length < 9) continue;

      const code = row[0]; // Shopee Product ID
      const name = row[1];
      const priceStr = row[2].replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr) || 0;
      const shopeeUrl = row[7];
      const affLink = row[8];

      if (!code || !name) continue;

      products.set(code, {
        code,
        name,
        price,
        affLink,
        category: guessCategory(name)
      });
    }
  }

  console.log(`✅ Loaded ${products.size} unique products.`);

  // 3. Batch insert
  const productList = Array.from(products.values());
  const BATCH_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < productList.length; i += BATCH_SIZE) {
    const batch = productList.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (p) => {
      // Check if already exists (by slug to ensure URL stability)
      const baseSlug = slugify(p.name);
      const uniqueSlug = `${baseSlug}-${p.code}`;

      const { data: existing } = await supabase.from('products').select('id').eq('slug', uniqueSlug).single();
      if (existing) {
        skipped++;
        return;
      }

      const { error } = await supabase.from('products').insert({
        id: crypto.randomUUID(),
        category_id: catCache[p.category],
        name: p.name,
        slug: uniqueSlug,
        price_min: p.price,
        price_max: p.price,
        affiliate_url: p.affLink,
        overall_score: 0, // Default to 0 until enrichment
        description: `สินค้า ${p.name} รุ่นใหม่ล่าสุดจากเทรนด์ไอที`,
        view_count: Math.floor(Math.random() * 100)
      });

      if (error) {
        // console.error(`❌ Error inserting ${p.name}:`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }));

    process.stdout.write(`\r📦 Progress: ${Math.min(i + BATCH_SIZE, productList.size)}/${productList.length} ... `);
  }

  console.log(`\n\n🎉 Done! Ingested: ${inserted} | Already exists: ${skipped}`);
  console.log("👉 Next Step: Run 'node fetch_images.js' to get images and details.");
}

run().catch(console.error);
