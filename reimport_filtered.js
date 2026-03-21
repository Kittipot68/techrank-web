// reimport_filtered.js
// Re-import products from CSV with filters:
// 1. Only Non-Cross border (Thai local shops)
// 2. Only trusted shops (Official, Preferred, Verified, or rating >= 4.7)
// 3. Must have image, valid price, sold > 0
// 4. Categories: headphones/earphones, keyboards, mice, speakers

require('dotenv').config({ path: 'd:/MY_FIRST_WEB/.env.local' });
const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
            else if (ch === '"') { inQuotes = false; }
            else { current += ch; }
        } else {
            if (ch === '"') { inQuotes = true; }
            else if (ch === ',') { fields.push(current); current = ''; }
            else { current += ch; }
        }
    }
    fields.push(current);
    return fields;
}

function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100)
        + '-' + Math.floor(Math.random() * 100000);
}

// ============================================================
//  Feature Detection & Data Generation (same as generate_product_data.js)
// ============================================================
const KNOWN_BRANDS = [
    'Sony', 'JBL', 'Bose', 'Sennheiser', 'Audio-Technica', 'AKG', 'Beyerdynamic',
    'Shure', 'HyperX', 'SteelSeries', 'Razer', 'Corsair', 'Logitech', 'Marshall',
    'Beats', 'Anker', 'Soundcore', 'Edifier', 'KZ', 'Moondrop', 'FiiO', 'Hoco',
    'Samsung', 'Apple', 'Xiaomi', 'Huawei', 'OPPO', 'Realme', 'QCY', 'Baseus',
    'Redragon', 'Keychron', 'Royal Kludge', 'Ducky', 'Leopold', 'Filco', 'ASUS',
    'AFUL', 'Creative', 'Harman Kardon', 'Jabra', 'Skullcandy', 'Onikuma',
    'Plextone', 'Havit', 'Philips', 'Panasonic', 'Pioneer', 'Denon', 'Yamaha',
    'NUBWO', 'SIGNO', 'Fantech', 'Dareu', 'Akko', 'Rapoo', 'Lenovo', 'HP',
    'Dell', 'MSI', 'TOA', 'GIONEE', 'Tronsmart', 'Tribit', 'EarFun', 'Nothing',
    '1MORE', 'Bang & Olufsen', 'Bowers & Wilkins', 'KEF', 'Klipsch', 'Focal',
    'Mackie', 'PreSonus', 'Behringer', 'JBL', 'Harman', 'Altec', 'IK Multimedia',
    'Fifine', 'Blue', 'Rode', 'Elgato', 'HyperX', 'Roccat', 'Glorious', 'Pulsar',
    'Lamzu', 'Vaxee', 'Zowie', 'BenQ', 'Darmoshark', 'Ninjutso', 'Endgame Gear',
    'Xtrfy', 'WK', 'Awei', 'UGREEN', 'Aukey'
];

function detectBrand(name) {
    const nameLower = name.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
        if (nameLower.includes(brand.toLowerCase())) return brand;
    }
    return null;
}

function detectFeatures(name) {
    const n = name.toLowerCase();
    return {
        bluetooth: /bluetooth|บลูทูธ|bt[0-9\s]|ไร้สาย|wireless/i.test(n),
        wired: /สาย|wired|3\.5mm|usb|type-c/i.test(n) && !/ไร้สาย|wireless/i.test(n),
        overEar: /over-ear|over ear|ครอบหู|headphone|headset|หูฟังครอบ/i.test(n),
        inEar: /in-ear|in ear|อินเอียร์|earphone|earbuds|หูฟังเอียร์|เอียร์บัด/i.test(n),
        tws: /tws|true wireless/i.test(n),
        anc: /anc|noise cancel|ตัดเสียง/i.test(n),
        mic: /mic|ไมค์|ไมโครโฟน|microphone/i.test(n),
        gaming: /gaming|เกม|game|gamer/i.test(n),
        rgb: /rgb|ไฟ led|led/i.test(n),
        foldable: /fold|พับ|พับได้/i.test(n),
        waterproof: /waterproof|ipx|กันน้ำ/i.test(n),
        touchControl: /touch|สัมผัส/i.test(n),
        mechanical: /mechanical|เมคานิคอล|กลไก|แกน/i.test(n),
        hotswap: /hot-swap|hotswap|hot swap/i.test(n),
        ergonomic: /ergonomic|ตามหลักสรีร/i.test(n),
        lightweight: /lightweight|น้ำหนักเบา|เบา/i.test(n),
        portable: /portable|พกพา/i.test(n),
        subwoofer: /subwoofer|ซับวูฟ/i.test(n),
        stereo: /stereo|สเตอริโอ/i.test(n),
        dpi: n.match(/(\d{3,5})\s*dpi/i),
    };
}

function generateHeadphoneData(name, price) {
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const isHighEnd = price > 2000;
    const isMidRange = price > 500;

    let type = 'Over-ear';
    if (f.inEar || f.tws) type = 'In-ear';

    let connection = 'สาย (Wired)';
    if (f.bluetooth && f.wired) connection = 'ไร้สาย + สาย (Hybrid)';
    else if (f.bluetooth || f.tws) connection = 'Bluetooth ไร้สาย';

    const driverSize = type === 'In-ear' ? (isHighEnd ? '10mm Dynamic + BA' : isMidRange ? '10mm' : '6mm-8mm') : (isHighEnd ? '50mm' : isMidRange ? '40mm' : '30mm-40mm');

    const specs = [
        { key: 'ประเภท', value: type === 'In-ear' ? 'หูฟังอินเอียร์' : 'หูฟังครอบหู' },
        { key: 'ไดร์เวอร์', value: driverSize },
        { key: 'การเชื่อมต่อ', value: connection },
        { key: 'ความถี่ตอบสนอง', value: isHighEnd ? '5Hz - 40kHz' : '20Hz - 20kHz' },
        { key: 'อิมพีแดนซ์', value: type === 'In-ear' ? (isHighEnd ? '32Ω' : '16Ω') : (isHighEnd ? '64Ω' : '32Ω') },
        { key: 'ความไว', value: isHighEnd ? '110 dB/mW' : isMidRange ? '105 dB/mW' : '100 dB/mW' },
    ];
    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    if (f.bluetooth || f.tws) {
        specs.push({ key: 'Bluetooth', value: isHighEnd ? '5.3' : isMidRange ? '5.2' : '5.0' });
        const battery = type === 'In-ear' ? (isHighEnd ? '8 ชม. (เคส 32 ชม.)' : '4-6 ชม. (เคส 20 ชม.)') : (isHighEnd ? '40 ชั่วโมง' : '20-30 ชั่วโมง');
        specs.push({ key: 'แบตเตอรี่', value: battery });
    }
    if (f.anc) specs.push({ key: 'ตัดเสียงรบกวน', value: 'ANC' });
    if (f.mic) specs.push({ key: 'ไมโครโฟน', value: f.gaming ? 'ไมค์บูมถอดได้' : 'ไมค์ในตัว' });
    if (f.waterproof) specs.push({ key: 'กันน้ำ', value: isHighEnd ? 'IPX5' : 'IPX4' });
    specs.push({ key: 'น้ำหนัก', value: type === 'In-ear' ? '5g (ต่อข้าง)' : (isHighEnd ? '250g' : '180g') });

    const pros = [];
    if (isHighEnd) pros.push('คุณภาพเสียงดีเยี่ยม ระดับ Hi-Fi');
    else if (isMidRange) pros.push('คุณภาพเสียงดี คุ้มค่าราคา');
    else pros.push('ราคาประหยัด เหมาะใช้งานทั่วไป');
    if (f.bluetooth || f.tws) pros.push('เชื่อมต่อไร้สายสะดวก');
    if (f.anc) pros.push('ตัดเสียงรบกวนได้ดี');
    if (f.gaming) pros.push('ดีเลย์ต่ำ เหมาะเล่นเกม');
    if (f.mic) pros.push('มีไมโครโฟนในตัว สนทนาชัดเจน');
    if (f.waterproof) pros.push('กันน้ำกันเหงื่อ เหมาะออกกำลังกาย');
    if (brand && ['Sony', 'Bose', 'Sennheiser', 'JBL', 'Audio-Technica', 'HyperX'].includes(brand))
        pros.push(`แบรนด์ ${brand} รับประกันคุณภาพ`);
    if (pros.length < 3) { pros.push('สวมใส่สบาย ดีไซน์ทันสมัย'); }

    const cons = [];
    if (f.bluetooth && !f.wired) cons.push('ต้องชาร์จแบตเตอรี่');
    if (type === 'Over-ear') cons.push('ขนาดใหญ่ พกพาไม่สะดวก');
    if (!f.anc) cons.push('ไม่มีระบบตัดเสียงรบกวน');
    if (!f.bluetooth && !f.tws) cons.push('ใช้ได้เฉพาะแบบมีสาย');
    if (price < 300) cons.push('วัสดุอาจไม่ทนทานมาก');
    if (cons.length < 2) cons.push('คู่มือส่วนใหญ่เป็นภาษาอังกฤษ');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

function generateKeyboardData(name, price) {
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const isHighEnd = price > 3000;

    let switchType = 'Mechanical';
    if (/gateron/i.test(name)) switchType = 'Gateron';
    else if (/cherry/i.test(name)) switchType = 'Cherry MX';
    else if (/kailh/i.test(name)) switchType = 'Kailh';

    const specs = [
        { key: 'ประเภท', value: f.mechanical ? 'คีย์บอร์ดเมคานิคอล' : 'คีย์บอร์ด' },
        { key: 'สวิตช์', value: switchType },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth + USB' : 'USB Wired' },
        { key: 'Keycap', value: isHighEnd ? 'PBT Double-shot' : 'ABS' },
        { key: 'ไฟ LED', value: f.rgb ? 'RGB Per-key' : 'ไม่มี' },
    ];
    if (f.hotswap) specs.push({ key: 'Hot-swap', value: 'รองรับ' });
    if (brand) specs.push({ key: 'แบรนด์', value: brand });

    const pros = ['สัมผัสการกดที่ดี ตอบสนองเร็ว'];
    if (f.hotswap) pros.push('Hot-swap เปลี่ยนสวิตช์ได้');
    if (f.bluetooth) pros.push('เชื่อมต่อได้ทั้งสายและไร้สาย');
    if (f.rgb) pros.push('ไฟ RGB สวยงาม');
    pros.push('เหมาะทั้งทำงานและเล่นเกม');

    const cons = ['เสียงดังกว่าคีย์บอร์ดทั่วไป'];
    if (!f.bluetooth) cons.push('ใช้ได้เฉพาะแบบมีสาย');
    if (isHighEnd) cons.push('ราคาสูง');
    cons.push('น้ำหนักมากกว่าคีย์บอร์ดปกติ');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

function generateMouseData(name, price) {
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const isHighEnd = price > 1500;
    const dpiMatch = f.dpi;
    const dpiValue = dpiMatch ? dpiMatch[1] : (isHighEnd ? '25600' : '1600');

    const specs = [
        { key: 'ประเภท', value: f.gaming ? 'เมาส์เกมมิ่ง' : 'เมาส์ทั่วไป' },
        { key: 'DPI', value: `สูงสุด ${dpiValue} DPI` },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth + USB Wireless' : 'USB Wired' },
        { key: 'เซ็นเซอร์', value: isHighEnd ? 'Optical (PixArt 3395)' : 'Optical' },
        { key: 'จำนวนปุ่ม', value: f.gaming ? '6-8 ปุ่ม' : '3-5 ปุ่ม' },
    ];
    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    if (f.rgb) specs.push({ key: 'ไฟ LED', value: 'RGB' });

    const pros = [];
    if (f.gaming) pros.push('ตอบสนองเร็ว เหมาะเล่นเกม FPS');
    if (f.ergonomic) pros.push('ดีไซน์ตามหลักสรีรศาสตร์');
    if (f.bluetooth) pros.push('เชื่อมต่อไร้สาย');
    pros.push('จับกระชับมือ ใช้งานสะดวก');
    if (pros.length < 3) pros.push('ราคาคุ้มค่า');

    const cons = [];
    if (!f.bluetooth) cons.push('ใช้แบบมีสายเท่านั้น');
    if (f.bluetooth) cons.push('ต้องชาร์จแบตเตอรี่');
    cons.push('ไม่มีกล่องเก็บให้');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

function generateSpeakerData(name, price) {
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const isHighEnd = price > 2000;
    const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*(?:นิ้ว|inch|")/i);
    const speakerSize = sizeMatch ? `${sizeMatch[1]} นิ้ว` : '3 นิ้ว';

    const specs = [
        { key: 'ประเภท', value: f.portable ? 'ลำโพงพกพา' : f.subwoofer ? 'ซับวูฟเฟอร์' : 'ลำโพงตั้งโต๊ะ' },
        { key: 'ขนาดไดร์เวอร์', value: speakerSize },
        { key: 'กำลังขับ', value: isHighEnd ? '40W' : '10W-20W' },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth + AUX' : 'สาย AUX 3.5mm' },
    ];
    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    if (f.waterproof) specs.push({ key: 'กันน้ำ', value: 'IPX7' });

    const pros = [];
    if (brand === 'JBL') pros.push('แบรนด์ JBL เสียงดีมีคุณภาพ');
    if (f.bluetooth) pros.push('เชื่อมต่อไร้สาย');
    if (f.portable) pros.push('พกพาสะดวก');
    pros.push('เสียงดัง ชัดเจน');
    if (pros.length < 3) pros.push('ดีไซน์สวยงาม');

    const cons = [];
    if (f.portable) cons.push('เสียงอาจไม่ดังเท่าลำโพงใหญ่');
    if (f.bluetooth) cons.push('ต้องชาร์จแบตเตอรี่');
    cons.push('เบสอาจไม่ลึกมากสำหรับห้องใหญ่');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

function generateStats() {
    const overall = (Math.random() * 3 + 7).toFixed(1);
    return {
        overall_score: parseFloat(overall),
        sound_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        fps_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        comfort_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        build_score: parseFloat((Math.random() * 3 + 7).toFixed(1)),
        view_count: Math.floor(Math.random() * 5000)
    };
}

function classifyProduct(cat1, cat2, cat3, title) {
    const combined = `${cat1}|${cat2}|${cat3}|${title}`.toLowerCase();

    if (combined.includes('earphone') || combined.includes('headphone') || combined.includes('headset') ||
        combined.includes('หูฟัง') || combined.includes('earbuds')) {
        return 'headphones';
    }
    if (combined.includes('keyboard') || combined.includes('คีย์บอร์ด')) {
        // Exclude keyboard accessories (wrist rests, stands, caps, etc.)
        if (/เคส|กล่อง|ที่วาง|สติ๊กเกอร์|keycap|wrist|stand|bag|case|cover/i.test(title)) return null;
        return 'keyboards';
    }
    if (combined.includes('mice') || combined.includes('mouse') || combined.includes('เมาส์')) {
        // Exclude mouse pads and accessories
        if (/pad|แผ่นรอง|mousepad|mouse pad|ที่วาง/i.test(title)) return null;
        return 'mice';
    }
    if (combined.includes('speaker') || combined.includes('ลำโพง')) {
        return 'speakers';
    }
    return null;
}

// ============================================================
//  MAIN
// ============================================================
async function main() {
    console.log("🚀 Starting filtered re-import...\n");

    // Step 1: Get category map
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const catMap = {};
    categories.forEach(c => catMap[c.slug] = c.id);
    console.log("Categories:", Object.keys(catMap).join(', '));

    // Step 2: Delete all existing products and specs
    console.log("\n🗑️  Deleting existing specs...");
    const { error: specDelErr } = await supabase.from('specs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (specDelErr) console.error("Spec delete error:", specDelErr);

    console.log("🗑️  Deleting existing products...");
    const { error: prodDelErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (prodDelErr) console.error("Product delete error:", prodDelErr);

    console.log("✅ Existing data cleared.\n");

    // Step 3: Scan CSV and collect filtered products
    const stream = fs.createReadStream('d:/MY_FIRST_WEB/csv/product.csv', { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let headers = [];
    let lineNum = 0;
    let currentRow = '';
    const collected = { headphones: [], keyboards: [], mice: [], speakers: [] };
    const MAX_PER_CAT = { headphones: 150, keyboards: 50, mice: 50, speakers: 50 };
    let scanned = 0;

    for await (const line of rl) {
        if (lineNum === 0) {
            headers = line.replace(/\r$/, '').replace(/^\uFEFF/, '').split(',');
            lineNum++;
            continue;
        }

        currentRow += (currentRow ? '\n' : '') + line;
        const quoteCount = (currentRow.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) continue;

        const fields = parseCSVLine(currentRow);
        currentRow = '';
        lineNum++;
        scanned++;

        if (fields.length < 47) continue;

        const cbOption = fields[1]?.trim();
        const cat1 = fields[2];
        const cat2 = fields[9];
        const cat3 = fields[24];
        const isPreferred = fields[5];
        const title = fields[6]?.trim();
        const isOfficial = fields[15];
        const shopRating = parseFloat(fields[36]);
        const shopeeVerified = fields[12];
        const shopName = fields[42];
        const price = parseFloat(fields[39]);
        const salePrice = parseFloat(fields[10]);
        const imageLink = fields[41];
        const itemSold = parseInt(fields[4]) || 0;
        const itemRating = parseFloat(fields[37]) || 0;
        const productLink = fields[45];
        const shortLink = fields[46];

        // ===== FILTERS =====

        // 1. Must be Non-Cross border (Thai local)
        if (cbOption === 'Cross border') continue;

        // 2. Must be trusted shop (at least one indicator)
        const isTrusted = (
            isOfficial === 'Official shop' ||
            isPreferred === 'Preferred shop' ||
            shopeeVerified === 'Preferred seller' ||
            shopRating >= 4.7
        );
        if (!isTrusted) continue;

        // 3. Must have basic data
        if (!imageLink || !title || title.length < 10) continue;
        if (price <= 0 || isNaN(price)) continue;
        if (itemSold < 1) continue;  // At least 1 sale

        // 4. Classify product
        const category = classifyProduct(cat1, cat2, cat3, title);
        if (!category) continue;
        if (!catMap[category]) continue;

        // 5. Check max per category
        if (collected[category].length >= MAX_PER_CAT[category]) continue;

        // Build product data
        const imageUrl = imageLink.startsWith('http') ? imageLink : 'https://cf.shopee.co.th/file/' + imageLink;
        const affiliateUrl = shortLink || productLink || '';

        collected[category].push({
            title,
            price,
            salePrice: salePrice > 0 ? salePrice : price,
            imageUrl,
            affiliateUrl,
            itemSold,
            itemRating,
            shopName,
            shopRating,
            isOfficial: isOfficial === 'Official shop',
            isPreferred: isPreferred === 'Preferred shop',
            categoryId: catMap[category],
            categorySlug: category,
        });

        // Check if all categories full
        const allFull = Object.keys(MAX_PER_CAT).every(k => collected[k].length >= MAX_PER_CAT[k]);
        if (allFull) break;

        if (scanned > 3000000) break;
    }

    console.log("📊 Scan complete. Collected:");
    for (const [cat, items] of Object.entries(collected)) {
        console.log(`  ${cat}: ${items.length} products`);
    }

    // Step 4: Sort by popularity (item_sold * rating) and insert
    let totalInserted = 0;
    let totalSpecs = 0;

    for (const [cat, items] of Object.entries(collected)) {
        if (items.length === 0) continue;

        // Sort by popularity
        items.sort((a, b) => (b.itemSold * b.itemRating) - (a.itemSold * a.itemRating));

        console.log(`\n📦 Inserting ${items.length} ${cat}...`);

        const batch = items.map(item => {
            const stats = generateStats();
            // Boost score for popular/well-rated items
            if (item.itemRating >= 4.8 && item.itemSold >= 50) {
                stats.overall_score = parseFloat((Math.random() * 1.5 + 8.5).toFixed(1));
            } else if (item.itemRating >= 4.5 && item.itemSold >= 10) {
                stats.overall_score = parseFloat((Math.random() * 2 + 7.5).toFixed(1));
            }

            return {
                category_id: item.categoryId,
                name: item.title.substring(0, 200),
                slug: generateSlug(item.title),
                price_min: item.salePrice,
                price_max: item.price,
                image_url: item.imageUrl,
                affiliate_url: item.affiliateUrl,
                ...stats,
            };
        });

        // Insert in chunks of 50
        for (let i = 0; i < batch.length; i += 50) {
            const chunk = batch.slice(i, i + 50);
            const { data, error } = await supabase.from('products').insert(chunk).select();

            if (error) {
                console.error(`❌ Insert error (${cat} chunk ${i}):`, error.message);
                continue;
            }

            totalInserted += data.length;

            // Generate and insert specs + pros/cons for each product
            const allSpecs = [];
            const updates = [];

            for (let j = 0; j < data.length; j++) {
                const product = data[j];
                const original = items[i + j];
                let genData;

                switch (cat) {
                    case 'headphones': genData = generateHeadphoneData(product.name, original.price); break;
                    case 'keyboards': genData = generateKeyboardData(product.name, original.price); break;
                    case 'mice': genData = generateMouseData(product.name, original.price); break;
                    case 'speakers': genData = generateSpeakerData(product.name, original.price); break;
                }

                if (genData) {
                    // Add shop trust info to specs
                    genData.specs.push({ key: 'ร้านค้า', value: original.shopName || 'N/A' });
                    genData.specs.push({ key: 'คะแนนร้าน', value: `${original.shopRating || 'N/A'}/5` });
                    if (original.isOfficial) genData.specs.push({ key: 'ร้านค้า Official', value: '✅ ร้านค้าทางการ' });
                    else if (original.isPreferred) genData.specs.push({ key: 'ร้านค้าแนะนำ', value: '✅ Preferred Shop' });
                    genData.specs.push({ key: 'ยอดขาย', value: `${original.itemSold} ชิ้น` });

                    // Specs
                    for (const s of genData.specs) {
                        allSpecs.push({ product_id: product.id, key: s.key, value: s.value });
                    }

                    // Pros/Cons update
                    updates.push(
                        supabase.from('products').update({ pros: genData.pros, cons: genData.cons }).eq('id', product.id)
                    );
                }
            }

            // Insert all specs
            if (allSpecs.length > 0) {
                const { error: specErr } = await supabase.from('specs').insert(allSpecs);
                if (specErr) console.error(`❌ Spec insert error:`, specErr.message);
                else totalSpecs += allSpecs.length;
            }

            // Update pros/cons
            await Promise.all(updates);
        }

        console.log(`  ✅ ${cat} done!`);
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`  Products inserted: ${totalInserted}`);
    console.log(`  Specs created: ${totalSpecs}`);
    console.log(`  All products are from Thai local, trusted shops only.`);

    // Show sample
    const { data: sample } = await supabase.from('products').select('name, pros, cons').limit(3);
    console.log("\n=== SAMPLE ===");
    for (const s of (sample || [])) {
        console.log(`\n📱 ${s.name.substring(0, 60)}...`);
        console.log(`  ✅ ${(s.pros || []).join(' | ')}`);
        console.log(`  ❌ ${(s.cons || []).join(' | ')}`);
    }
}

main().catch(console.error);
