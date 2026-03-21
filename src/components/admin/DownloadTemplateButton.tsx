"use client";

import { getCategories } from "@/app/actions/admin";
import { useEffect, useState } from "react";

export default function DownloadTemplateButton() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const handleDownload = () => {
        // Build category reference header
        const catRef = categories.map(c => `${c.slug}=${c.id}`).join(' | ');

        const csvContent = `name,slug,category_id,description,price_min,price_max,overall_score,sound_score,fps_score,comfort_score,build_score,pros,cons,image_url,affiliate_url,spec_1_key,spec_1_value,spec_2_key,spec_2_value,spec_3_key,spec_3_value,spec_4_key,spec_4_value,spec_5_key,spec_5_value,spec_6_key,spec_6_value,spec_7_key,spec_7_value,spec_8_key,spec_8_value,spec_9_key,spec_9_value,spec_10_key,spec_10_value
Sony WH-1000XM5,sony-wh-1000xm5,${categories.find(c => c.slug === 'headphones')?.id || 'CATEGORY_ID'},"หูฟังไร้สาย Over-ear ระดับพรีเมียม ตัดเสียงรบกวน ANC ดีที่สุดในตลาด ไดร์เวอร์ 30mm เสียงใสคมชัด แบตเตอรี่ 30 ชั่วโมง",8990,12990,9.2,9.5,7.0,9.0,8.8,ระบบ ANC ดีที่สุดในตลาด;คุณภาพเสียงยอดเยี่ยม รองรับ LDAC;แบตเตอรี่ 30 ชม. ชาร์จเร็ว;น้ำหนักเบา สวมใส่สบาย;Multipoint 2 อุปกรณ์,ราคาสูง;ไม่พับเก็บได้;ไม่มีช่อง 3.5mm โดยตรง,https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg,,ประเภท,Over-ear Wireless,ไดร์เวอร์,30mm,การเชื่อมต่อ,Bluetooth 5.2 + สาย 3.5mm,ความถี่ตอบสนอง,4Hz - 40kHz (LDAC),ตัดเสียงรบกวน,Auto NC Optimizer + 8 ไมค์,Codec,"SBC, AAC, LDAC",แบตเตอรี่,30 ชั่วโมง (ANC เปิด),ชาร์จเร็ว,3 นาที = 3 ชม.,น้ำหนัก,250g,แบรนด์,Sony`;

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "techrank_product_template.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadCategoryList = () => {
        let content = "=== TechRank Category List ===\n\n";
        content += "ใช้ category_id ในไฟล์ CSV ตาม slug ที่ต้องการ:\n\n";
        categories.forEach(c => {
            content += `${c.name} (${c.slug}): ${c.id}\n`;
        });
        content += "\n=== คัดลอก ID ไปใช้ใน CSV column 'category_id' ===\n";

        const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "techrank_categories.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex gap-2 items-center">
            <button onClick={handleDownload} className="text-blue-600 hover:underline font-medium text-sm">
                📥 Template CSV
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={handleDownloadCategoryList} className="text-purple-600 hover:underline font-medium text-sm">
                📋 รายชื่อหมวดหมู่
            </button>
        </div>
    );
}
