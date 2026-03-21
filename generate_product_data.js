// generate_product_data.js
// Generates specs, pros, and cons for all TechRank products based on product names and categories
require('dotenv').config({ path: 'd:/MY_FIRST_WEB/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ============================================================
//  Brand Detection
// ============================================================
const KNOWN_BRANDS = [
    'Sony', 'JBL', 'Bose', 'Sennheiser', 'Audio-Technica', 'AKG', 'Beyerdynamic',
    'Shure', 'HyperX', 'SteelSeries', 'Razer', 'Corsair', 'Logitech', 'Marshall',
    'Beats', 'Anker', 'Soundcore', 'Edifier', 'KZ', 'Moondrop', 'FiiO', 'Hoco',
    'Samsung', 'Apple', 'Xiaomi', 'Huawei', 'OPPO', 'Realme', 'QCY', 'Baseus',
    'Redragon', 'Keychron', 'Royal Kludge', 'Ducky', 'Leopold', 'Filco', 'ASUS',
    'AFUL', 'Creative', 'Harman Kardon', 'Bang & Olufsen', 'Jabra', 'Plantronics',
    'Skullcandy', 'KingTop', 'Onikuma', 'Plextone', 'Havit', 'WK Design',
    'Philips', 'Panasonic', 'Pioneer', 'Denon', 'Yamaha', 'Mackie', 'PreSonus',
    'NUBWO', 'SIGNO', 'THUNDEROBOT', 'Fantech', 'Dareu', 'Akko', 'Rapoo',
    'VChoice', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI'
];

function detectBrand(name) {
    const nameLower = name.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
        if (nameLower.includes(brand.toLowerCase())) return brand;
    }
    return null;
}

// ============================================================
//  Feature Detection from Product Name
// ============================================================
function detectFeatures(name) {
    const n = name.toLowerCase();
    return {
        // Connection
        bluetooth: /bluetooth|บลูทูธ|bt[0-9\s]|ไร้สาย|wireless/i.test(n),
        wired: /สาย|wired|3\.5mm|usb|type-c/i.test(n) && !/ไร้สาย|wireless/i.test(n),
        usb: /usb/i.test(n),
        typeC: /type-c|type c|usb-c/i.test(n),
        jack35: /3\.5\s*mm|aux|แจ็ค/i.test(n),

        // Type
        overEar: /over-ear|over ear|ครอบหู|headphone|headset|หูฟังครอบ/i.test(n),
        inEar: /in-ear|in ear|อินเอียร์|earphone|earbuds|หูฟังเอียร์|เอียร์บัด/i.test(n),
        tws: /tws|true wireless|หูฟังไร้สาย/i.test(n),
        onEar: /on-ear|on ear/i.test(n),

        // Features
        anc: /anc|noise cancel|ตัดเสียง|noice cancel/i.test(n),
        mic: /mic|ไมค์|ไมโครโฟน|microphone/i.test(n),
        gaming: /gaming|เกม|game|gamer/i.test(n),
        rgb: /rgb|ไฟ led|led/i.test(n),
        foldable: /fold|พับ|พับได้/i.test(n),
        waterproof: /waterproof|ipx|กันน้ำ/i.test(n),
        touchControl: /touch|สัมผัส/i.test(n),

        // Keyboard specific
        mechanical: /mechanical|เมคานิคอล|กลไก|แกน/i.test(n),
        hotswap: /hot-swap|hotswap|hot swap/i.test(n),
        tkl: /tkl|tenkeyless|87|75%|65%|60%/i.test(n),
        fullsize: /full-size|fullsize|100%|104|108/i.test(n),
        numpad: /numpad|นัมแพด/i.test(n),

        // Mouse specific
        dpi: n.match(/(\d{3,5})\s*dpi/i),
        ergonomic: /ergonomic|ตามหลักสรีร/i.test(n),
        lightweight: /lightweight|น้ำหนักเบา|เบา/i.test(n),

        // Speaker specific
        portable: /portable|พกพา/i.test(n),
        subwoofer: /subwoofer|ซับวูฟ/i.test(n),
        stereo: /stereo|สเตอริโอ/i.test(n),
    };
}

// ============================================================
//  Headphone Data Generator
// ============================================================
function generateHeadphoneData(product) {
    const name = product.name;
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const price = product.price_min || 0;

    // Determine type
    let type = 'Over-ear';
    if (f.inEar || f.tws) type = 'In-ear';
    else if (f.onEar) type = 'On-ear';

    // Determine connection
    let connection = 'สาย (Wired)';
    if (f.bluetooth && f.wired) connection = 'ไร้สาย + สาย (Hybrid)';
    else if (f.bluetooth || f.tws) connection = 'Bluetooth ไร้สาย';

    // Generate realistic specs based on price range and type
    const isHighEnd = price > 2000;
    const isMidRange = price > 500 && price <= 2000;

    const driverSize = type === 'In-ear'
        ? (isHighEnd ? '10mm Dynamic + BA' : isMidRange ? '10mm' : '6mm-8mm')
        : (isHighEnd ? '50mm' : isMidRange ? '40mm' : '30mm-40mm');

    const freqResponse = isHighEnd ? '5Hz - 40kHz' : isMidRange ? '20Hz - 20kHz' : '20Hz - 20kHz';
    const impedance = type === 'In-ear'
        ? (isHighEnd ? '32Ω' : '16Ω')
        : (isHighEnd ? '64Ω' : isMidRange ? '32Ω' : '32Ω');

    const sensitivity = isHighEnd ? '110 dB/mW' : isMidRange ? '105 dB/mW' : '100 dB/mW';

    const specs = [
        { key: 'ประเภท', value: type === 'In-ear' ? 'หูฟังอินเอียร์' : type === 'On-ear' ? 'หูฟังออนเอียร์' : 'หูฟังครอบหู' },
        { key: 'ไดร์เวอร์', value: driverSize },
        { key: 'การเชื่อมต่อ', value: connection },
        { key: 'ความถี่ตอบสนอง', value: freqResponse },
        { key: 'อิมพีแดนซ์', value: impedance },
        { key: 'ความไว', value: sensitivity },
    ];

    if (brand) specs.push({ key: 'แบรนด์', value: brand });

    if (f.bluetooth || f.tws) {
        specs.push({ key: 'Bluetooth', value: isHighEnd ? '5.3' : isMidRange ? '5.2' : '5.0' });
        const battery = type === 'In-ear'
            ? (isHighEnd ? '8 ชม. (เคส 32 ชม.)' : isMidRange ? '6 ชม. (เคส 24 ชม.)' : '4 ชม. (เคส 16 ชม.)')
            : (isHighEnd ? '40 ชั่วโมง' : isMidRange ? '30 ชั่วโมง' : '20 ชั่วโมง');
        specs.push({ key: 'แบตเตอรี่', value: battery });
    }

    if (f.anc) specs.push({ key: 'ตัดเสียงรบกวน', value: isHighEnd ? 'ANC แบบ Adaptive' : 'ANC' });
    if (f.mic) specs.push({ key: 'ไมโครโฟน', value: f.gaming ? 'ไมค์บูมถอดได้' : 'ไมค์ในตัว' });
    if (f.waterproof) specs.push({ key: 'กันน้ำ', value: isHighEnd ? 'IPX5' : 'IPX4' });
    if (f.foldable) specs.push({ key: 'พับได้', value: 'ใช่' });

    const weight = type === 'In-ear'
        ? (isHighEnd ? '5.5g (ต่อข้าง)' : '4g-6g (ต่อข้าง)')
        : (isHighEnd ? '250g' : isMidRange ? '220g' : '150g-200g');
    specs.push({ key: 'น้ำหนัก', value: weight });

    // Generate pros
    const pros = [];
    if (isHighEnd) pros.push('คุณภาพเสียงดีเยี่ยม ระดับ Hi-Fi');
    else if (isMidRange) pros.push('คุณภาพเสียงดี คุ้มค่าราคา');
    else pros.push('ราคาประหยัด เหมาะสำหรับใช้งานทั่วไป');

    if (f.bluetooth || f.tws) pros.push('เชื่อมต่อไร้สายสะดวก');
    if (f.anc) pros.push('ตัดเสียงรบกวนได้ดี เหมาะใช้ในที่สาธารณะ');
    if (f.gaming) pros.push('ดีเลย์ต่ำ เหมาะสำหรับเล่นเกม');
    if (f.mic) pros.push('มีไมโครโฟนในตัว สนทนาได้ชัดเจน');
    if (f.waterproof) pros.push('กันน้ำกันเหงื่อ เหมาะออกกำลังกาย');
    if (f.foldable) pros.push('พับเก็บสะดวก พกพาง่าย');
    if (brand && ['Sony', 'Bose', 'Sennheiser', 'JBL', 'Audio-Technica'].includes(brand))
        pros.push(`แบรนด์ ${brand} รับประกันคุณภาพ`);
    if (f.touchControl) pros.push('ควบคุมด้วยระบบสัมผัส ใช้งานง่าย');

    if (pros.length < 3) {
        if (type === 'Over-ear' || type === 'On-ear') pros.push('สวมใส่สบาย ไม่กดหู');
        if (type === 'In-ear') pros.push('น้ำหนักเบา ใส่สบาย');
        pros.push('ดีไซน์สวยงาม ทันสมัย');
    }

    // Generate cons
    const cons = [];
    if (f.bluetooth && !f.wired) cons.push('ต้องชาร์จแบตเตอรี่');
    if (type === 'Over-ear') cons.push('ขนาดใหญ่ พกพาไม่สะดวก');
    if (type === 'In-ear' && !f.anc) cons.push('ไม่มีระบบตัดเสียงรบกวน');
    if (!f.bluetooth && !f.tws) cons.push('ใช้ได้เฉพาะแบบมีสาย');
    if (price < 300) cons.push('วัสดุอาจไม่ทนทานมาก');
    if (f.gaming && !f.bluetooth) cons.push('สายอาจเกะกะขณะใช้งาน');
    if (!brand || brand === 'NoBrand') cons.push('แบรนด์ไม่เป็นที่รู้จัก อาจหาอะไหล่ยาก');
    if (isHighEnd) cons.push('ราคาสูง');

    if (cons.length < 2) {
        cons.push('คู่มือส่วนใหญ่เป็นภาษาอังกฤษ');
        cons.push('ไม่มีกล่องเก็บหูฟังให้');
    }

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

// ============================================================
//  Keyboard Data Generator
// ============================================================
function generateKeyboardData(product) {
    const name = product.name;
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const price = product.price_min || 0;
    const isHighEnd = price > 3000;
    const isMidRange = price > 1000;

    // Detect switch type from name
    let switchType = 'Mechanical';
    if (/gateron/i.test(name)) switchType = 'Gateron';
    else if (/cherry/i.test(name)) switchType = 'Cherry MX';
    else if (/kailh/i.test(name)) switchType = 'Kailh';
    else if (/outemu/i.test(name)) switchType = 'Outemu';

    let switchColor = 'Red (Linear)';
    if (/blue|น้ำเงิน/i.test(name)) switchColor = 'Blue (Clicky)';
    else if (/brown|น้ำตาล/i.test(name)) switchColor = 'Brown (Tactile)';
    else if (/red|แดง/i.test(name)) switchColor = 'Red (Linear)';

    let layout = 'Full-size (100%)';
    if (f.tkl) {
        if (/75%/i.test(name)) layout = '75%';
        else if (/65%/i.test(name)) layout = '65%';
        else if (/60%/i.test(name)) layout = '60%';
        else layout = 'TKL (80%)';
    }

    const specs = [
        { key: 'ประเภท', value: f.mechanical ? 'คีย์บอร์ดเมคานิคอล' : 'คีย์บอร์ดเมมเบรน' },
        { key: 'สวิตช์', value: `${switchType} ${switchColor}` },
        { key: 'เลย์เอาต์', value: layout },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth + USB (Tri-mode)' : 'USB Wired' },
        { key: 'Keycap', value: isHighEnd ? 'PBT Double-shot' : 'ABS' },
        { key: 'ไฟ LED', value: f.rgb ? 'RGB Per-key' : 'ไม่มี' },
    ];

    if (f.hotswap) specs.push({ key: 'Hot-swap', value: 'รองรับ (เปลี่ยนสวิตช์ได้)' });
    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    specs.push({ key: 'ระบบปฏิบัติการ', value: 'Windows / macOS / Linux' });

    const pros = [];
    if (f.mechanical) pros.push('สัมผัสการกดที่ดี ตอบสนองเร็ว');
    if (f.hotswap) pros.push('Hot-swap เปลี่ยนสวิตช์ได้ตามใจ');
    if (f.bluetooth) pros.push('เชื่อมต่อได้ทั้งสายและไร้สาย');
    if (f.rgb) pros.push('ไฟ RGB สวยงาม ปรับแต่งได้');
    if (isHighEnd) pros.push('วัสดุ build quality เยี่ยม');
    if (brand === 'Keychron') pros.push('แบรนด์ Keychron คุณภาพดี มีประกันศูนย์ไทย');
    pros.push('พิมพ์สะดวก เหมาะทั้งทำงานและเล่นเกม');
    if (pros.length < 3) pros.push('ดีไซน์สวย ทันสมัย');

    const cons = [];
    if (f.mechanical) cons.push('เสียงดังกว่าคีย์บอร์ดทั่วไป');
    if (!f.bluetooth) cons.push('ใช้ได้เฉพาะแบบมีสาย');
    if (isHighEnd) cons.push('ราคาสูง');
    cons.push('ต้องปรับตัวกับเลย์เอาต์ใหม่');
    if (cons.length < 2) cons.push('น้ำหนักมากกว่าคีย์บอร์ดปกติ');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

// ============================================================
//  Mouse Data Generator
// ============================================================
function generateMouseData(product) {
    const name = product.name;
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const price = product.price_min || 0;
    const isHighEnd = price > 1500;

    const dpiMatch = f.dpi;
    const dpiValue = dpiMatch ? dpiMatch[1] : (isHighEnd ? '25600' : '1600');

    const specs = [
        { key: 'ประเภท', value: f.gaming ? 'เมาส์เกมมิ่ง' : 'เมาส์ทั่วไป' },
        { key: 'DPI', value: `สูงสุด ${dpiValue} DPI` },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth + USB Wireless' : 'USB Wired' },
        { key: 'เซ็นเซอร์', value: isHighEnd ? 'Optical (PixArt 3395)' : 'Optical' },
        { key: 'จำนวนปุ่ม', value: f.gaming ? '6-8 ปุ่ม (ปรับแต่งได้)' : '3-5 ปุ่ม' },
        { key: 'ไฟ LED', value: f.rgb ? 'RGB 16.8 ล้านสี' : 'ไม่มี' },
    ];

    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    if (f.ergonomic) specs.push({ key: 'ดีไซน์', value: 'Ergonomic ตามหลักสรีรศาสตร์' });
    if (f.bluetooth) specs.push({ key: 'แบตเตอรี่', value: isHighEnd ? '70 ชั่วโมง' : '12 เดือน (ถ่าน AA)' });
    specs.push({ key: 'น้ำหนัก', value: f.lightweight ? '60g-70g (น้ำหนักเบาพิเศษ)' : '80g-120g' });

    const pros = [];
    if (f.gaming) pros.push('ตอบสนองเร็ว เหมาะเล่นเกม FPS');
    if (f.ergonomic) pros.push('ดีไซน์ตามหลักสรีรศาสตร์ ลดอาการปวดข้อมือ');
    if (f.bluetooth) pros.push('เชื่อมต่อไร้สาย ไม่มีสายรุงรัง');
    if (f.lightweight) pros.push('น้ำหนักเบาพิเศษ ใช้งานได้ทั้งวัน');
    if (f.rgb) pros.push('ไฟ RGB สวยงาม ปรับสีได้');
    pros.push('จับกระชับมือ ใช้งานสะดวก');
    if (pros.length < 3) pros.push('ราคาคุ้มค่า');

    const cons = [];
    if (f.gaming && !f.bluetooth) cons.push('ใช้แบบมีสายเท่านั้น');
    if (f.bluetooth) cons.push('ต้องชาร์จแบตเตอรี่');
    if (!f.gaming) cons.push('DPI ไม่สูงมาก ไม่เหมาะเล่นเกมจริงจัง');
    cons.push('ไม่มีถุงหรือกล่องเก็บให้');
    if (cons.length < 2) cons.push('ซอฟต์แวร์ปรับแต่งอาจใช้งานยาก');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

// ============================================================
//  Speaker Data Generator
// ============================================================
function generateSpeakerData(product) {
    const name = product.name;
    const brand = detectBrand(name);
    const f = detectFeatures(name);
    const price = product.price_min || 0;
    const isHighEnd = price > 2000;

    // Detect speaker size
    const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*(?:นิ้ว|inch|")/i);
    const speakerSize = sizeMatch ? `${sizeMatch[1]} นิ้ว` : '3 นิ้ว';

    const specs = [
        { key: 'ประเภท', value: f.portable ? 'ลำโพงพกพา' : f.subwoofer ? 'ลำโพงซับวูฟเฟอร์' : 'ลำโพงตั้งโต๊ะ' },
        { key: 'ขนาดไดร์เวอร์', value: speakerSize },
        { key: 'กำลังขับ', value: isHighEnd ? '40W' : '10W-20W' },
        { key: 'การเชื่อมต่อ', value: f.bluetooth ? 'Bluetooth 5.0 + AUX' : 'สาย AUX 3.5mm' },
        { key: 'ช่วงความถี่', value: f.subwoofer ? '20Hz - 200Hz' : '60Hz - 20kHz' },
    ];

    if (brand) specs.push({ key: 'แบรนด์', value: brand });
    if (f.bluetooth) specs.push({ key: 'แบตเตอรี่', value: isHighEnd ? '12 ชั่วโมง' : '6-8 ชั่วโมง' });
    if (f.waterproof) specs.push({ key: 'กันน้ำ', value: 'IPX7' });
    if (f.stereo) specs.push({ key: 'ระบบเสียง', value: 'Stereo 2.0' });

    const pros = [];
    if (brand === 'JBL') pros.push('แบรนด์ JBL เสียงดีมีคุณภาพ');
    if (f.bluetooth) pros.push('เชื่อมต่อไร้สาย ใช้งานสะดวก');
    if (f.portable) pros.push('ขนาดเล็กกะทัดรัด พกพาง่าย');
    if (f.waterproof) pros.push('กันน้ำ ใช้ริมสระหรือชายหาดได้');
    pros.push('เสียงดัง ชัดเจน');
    if (isHighEnd) pros.push('เบสหนักแน่น ให้เสียงมีมิติ');
    if (pros.length < 3) pros.push('ดีไซน์สวยงาม ทันสมัย');

    const cons = [];
    if (f.portable) cons.push('เสียงอาจไม่ดังเท่าลำโพงใหญ่');
    if (f.bluetooth) cons.push('ต้องชาร์จแบตเตอรี่');
    if (!f.stereo) cons.push('เสียงเป็นแบบ Mono');
    cons.push('เบสอาจไม่ลึกมากสำหรับห้องใหญ่');
    if (cons.length < 2) cons.push('ไม่มีเคสพกพาให้');

    return { specs, pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
}

// ============================================================
//  Main Execution
// ============================================================
async function main() {
    console.log("🚀 Starting data generation...\n");

    // Get all categories
    const { data: categories } = await supabase.from('categories').select('*');
    const catMap = {};
    categories.forEach(c => catMap[c.id] = c.slug);

    // Get all products
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug, category_id, price_min, pros, cons');

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log(`📦 Found ${products.length} products total\n`);

    let updated = 0;
    let specCount = 0;

    for (const product of products) {
        const catSlug = catMap[product.category_id];
        let data;

        switch (catSlug) {
            case 'headphones':
            case 'earbuds':
                data = generateHeadphoneData(product);
                break;
            case 'keyboards':
                data = generateKeyboardData(product);
                break;
            case 'mice':
                data = generateMouseData(product);
                break;
            case 'speakers':
                data = generateSpeakerData(product);
                break;
            default:
                // Use headphone generator as default for audio products
                data = generateHeadphoneData(product);
                break;
        }

        if (!data) continue;

        // Update pros and cons
        const { error: updateError } = await supabase
            .from('products')
            .update({ pros: data.pros, cons: data.cons })
            .eq('id', product.id);

        if (updateError) {
            console.error(`❌ Error updating ${product.name}:`, updateError);
            continue;
        }

        // Delete old specs
        await supabase.from('specs').delete().eq('product_id', product.id);

        // Insert new specs
        const specsToInsert = data.specs.map(s => ({
            product_id: product.id,
            key: s.key,
            value: s.value
        }));

        const { error: specError } = await supabase.from('specs').insert(specsToInsert);
        if (specError) {
            console.error(`❌ Error inserting specs for ${product.name}:`, specError);
        } else {
            specCount += specsToInsert.length;
        }

        updated++;
        if (updated % 20 === 0) {
            console.log(`✅ Updated ${updated}/${products.length} products...`);
        }
    }

    console.log(`\n🎉 Done! Updated ${updated} products with ${specCount} spec entries.`);

    // Show a sample
    const { data: sample } = await supabase
        .from('products')
        .select('name, pros, cons')
        .limit(3);

    console.log("\n=== SAMPLE RESULTS ===");
    for (const s of sample) {
        console.log(`\n📱 ${s.name}`);
        console.log(`  ✅ Pros: ${s.pros.join(' | ')}`);
        console.log(`  ❌ Cons: ${s.cons.join(' | ')}`);
    }

    const { data: sampleSpecs } = await supabase
        .from('specs')
        .select('key, value, products!inner(name)')
        .limit(10);

    console.log("\n=== SAMPLE SPECS ===");
    for (const sp of (sampleSpecs || [])) {
        console.log(`  ${sp.key}: ${sp.value}`);
    }
}

main().catch(console.error);
