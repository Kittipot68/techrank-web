const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runVisualEnrichment() {
    console.log("🌟 Starting Visual-Enhanced Re-Enrichment for TCL 98T8D...");
    
    const id = "8b3e805f-4fd8-4ca9-9e76-324bc0f5ca32";
    
    // Core Elite Specs from Visual Audit
    const megaSpecs = [
        { key: "เทคโนโลยีจอภาพ", value: "QD-Mini LED Dimming" },
        { key: "ประเภทแผงหน้าจอ", value: "HVA Panel (Contrast สูงพิเศษ)" },
        { key: "ชิปประมวลผล", value: "AiPQ Pro Processor" },
        { key: "อัตรารีเฟรช", value: "144Hz Native / 240Hz Game Accelerator" },
        { key: "เทคโนโลยีสีภ", value: "QLED (93% DCI-P3)" },
        { key: "ความละเอียด", value: "4K UHD (3840 x 2160)" },
        { key: "ความสว่าง", value: "High HDR Brightness" },
        { key: "มาตรฐานภาพ", value: "IMAX Enhanced, Dolby Vision IQ" },
        { key: "HDR Support", value: "HDR10+, HLG" },
        { key: "ระบบเสียง", value: "ONKYO 2.1 Hi-Fi System พร้อม Subwoofer" },
        { key: "เทคโนโลยีเสียง", value: "Dolby Atmos, DTS:X" },
        { key: "กำลังขับเสียง", value: "60W" },
        { key: "ฟีเจอร์เกมมิ่ง", value: "HDMI 2.1, ALLM, VRR, AMD FreeSync Premium" },
        { key: "ระบบปฏิบัติการ", regex: "Google TV (พร้อมคำสั่งเสียง Hands-free)" },
        { key: "ดีไซน์", value: "Slim & Unibody Metallic Design" },
        { key: "การเชื่อมต่อไร้สาย", value: "Wi-Fi 5 (Dual Band 2.4/5GHz), Bluetooth 5.0" },
        { key: "พอร์ตการเชื่อมต่อ", value: "HDMI 2.1, USB 3.0, LAN, AV, Optical" },
        { key: "ถนอมสายตา", value: "TÜV Low Blue Light / Flicker Free" },
        { key: "การรับประกัน", value: "3 ปี (เมื่อลงทะเบียนผ่านเว็บ TCL)" }
    ];

    const pros = [
        "เทคโนโลยี QD-Mini LED ให้ Contrast และความสว่างระดับท็อป",
        "แผงจอ HVA ให้สีดำที่ลึกและสมจริงกว่าจอ IPS ทั่วไป",
        "รองรับ 144Hz และ FreeSync Premium ตอบโจทย์เกมเมอร์ตัวจริง",
        "ระบบเสียง ONKYO 2.1 พร้อมซับวูฟเฟอร์ในตัว เสียงแน่นไม่ต้องง้อ Soundbar",
        "ดีไซน์ Unibody โลหะ หรูหราและแข็งแรงทนทาน",
        "รองรับทั้ง IMAX Enhanced และ Dolby Vision IQ ครบทุกความบันเทิง"
    ];

    const cons = [
        "ขนาด 98 นิ้วใหญ่มาก ต้องใช้พื้นที่และโต๊ะวางที่แข็งแรงเป็นพิเศษ",
        "น้ำหนักตัวเครื่องค่อนข้างมาก (ประมาณ 70kg+) ต้องใช้คนติดตั้งหลายคน",
        "พอร์ต HDMI 2.1 มีจำนวนจำกัด (ควรเช็คจำนวนพอร์ตที่รองรับ 144Hz จริง)"
    ];

    const review = `บทวิเคราะห์จาก TechRank: TCL 98T8D คือนิยามของ "โรงภาพยนตร์ในบ้าน" ที่แท้จริงครับ ด้วยการนำเทคโนโลยี QD-Mini LED มาผสานกับแผงจอ HVA ทำให้ได้ภาพที่มีมิติและสีดำสนิทใกล้เคียง OLED แต่ให้ความสว่างที่สูงกว่ามาก เหมาะกับห้องนั่งเล่นที่มีแสงสว่างปกติ จุดที่น่าประทับใจที่สุดคือการใส่ชิป AiPQ Pro Processor มาให้ ซึ่งช่วย Upscale คอนเทนต์เก่าๆ ให้ดูคมชัดบนจอขนาด 98 นิ้วได้อย่างน่าเหลือเชื่อ หากคุณมีพื้นที่และงบประมาณ นี่คือทีวีที่คุ้มค่าที่สุดในบรรดาจอขนาดยักษ์ครับ`;

    // 💾 Updating Database
    await supabase.from('products').update({
        description: review + "\n\n---\n\n(ข้อมูลสเปคสกัดโดยระบบ AI Visual Audit จากรายละเอียดอย่างเป็นทางการ)",
        pros: pros,
        cons: cons,
        overall_score: 9.4
    }).eq('id', id);

    await supabase.from('specs').delete().eq('product_id', id);
    await supabase.from('specs').insert(
        megaSpecs.map(s => ({ product_id: id, key: s.key, value: s.value }))
    );

    console.log("✅ Ultra-Elite Visual Enrichment Complete!");
    console.log(`Specs Saved: ${megaSpecs.length}`);
}

runVisualEnrichment();
