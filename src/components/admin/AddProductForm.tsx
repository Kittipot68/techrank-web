"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { addProduct, saveProductSpecs } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Sparkles } from "lucide-react";

type AddProductFormProps = {
    categories: any[];
}

// Spec templates by category slug
const SPEC_TEMPLATES: Record<string, { key: string; value: string }[]> = {
    headphones: [
        { key: "ประเภท", value: "" },
        { key: "ไดร์เวอร์", value: "" },
        { key: "การเชื่อมต่อ", value: "" },
        { key: "ความถี่ตอบสนอง", value: "" },
        { key: "อิมพีแดนซ์", value: "" },
        { key: "ความไว", value: "" },
        { key: "Bluetooth", value: "" },
        { key: "แบตเตอรี่", value: "" },
        { key: "ตัดเสียงรบกวน (ANC)", value: "" },
        { key: "น้ำหนัก", value: "" },
        { key: "แบรนด์", value: "" },
    ],
    earbuds: [
        { key: "ประเภท", value: "True Wireless" },
        { key: "ไดร์เวอร์", value: "" },
        { key: "Bluetooth", value: "" },
        { key: "แบตเตอรี่ (หูฟัง)", value: "" },
        { key: "แบตเตอรี่ (เคส)", value: "" },
        { key: "ตัดเสียงรบกวน (ANC)", value: "" },
        { key: "กันน้ำ", value: "" },
        { key: "น้ำหนัก", value: "" },
        { key: "แบรนด์", value: "" },
    ],
    keyboards: [
        { key: "ประเภท", value: "" },
        { key: "สวิตช์", value: "" },
        { key: "เลย์เอาต์", value: "" },
        { key: "การเชื่อมต่อ", value: "" },
        { key: "Keycap", value: "" },
        { key: "Hot-swap", value: "" },
        { key: "ไฟ LED", value: "" },
        { key: "แบตเตอรี่", value: "" },
        { key: "แบรนด์", value: "" },
    ],
    mice: [
        { key: "ประเภท", value: "" },
        { key: "เซ็นเซอร์", value: "" },
        { key: "DPI สูงสุด", value: "" },
        { key: "การเชื่อมต่อ", value: "" },
        { key: "Polling Rate", value: "" },
        { key: "จำนวนปุ่ม", value: "" },
        { key: "น้ำหนัก", value: "" },
        { key: "แบตเตอรี่", value: "" },
        { key: "แบรนด์", value: "" },
    ],
    speakers: [
        { key: "ประเภท", value: "" },
        { key: "กำลังขับ (Watt)", value: "" },
        { key: "ขนาดไดร์เวอร์", value: "" },
        { key: "การเชื่อมต่อ", value: "" },
        { key: "Bluetooth", value: "" },
        { key: "แบตเตอรี่", value: "" },
        { key: "กันน้ำ", value: "" },
        { key: "น้ำหนัก", value: "" },
        { key: "แบรนด์", value: "" },
    ],
    monitors: [
        { key: "ขนาดจอ", value: "" },
        { key: "ความละเอียด", value: "" },
        { key: "อัตรารีเฟรช", value: "" },
        { key: "ประเภทแผง", value: "" },
        { key: "Response Time", value: "" },
        { key: "พอร์ต", value: "" },
        { key: "แบรนด์", value: "" },
    ],
};

function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

export default function AddProductForm({ categories }: AddProductFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
    const [pros, setPros] = useState<string[]>(['']);
    const [cons, setCons] = useState<string[]>(['']);
    const [selectedCatSlug, setSelectedCatSlug] = useState('');
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const nameValue = watch("name");

    // Auto-generate slug from name
    function handleNameChange(name: string) {
        setValue("slug", generateSlug(name));
    }

    // Load spec template based on category
    function loadSpecTemplate() {
        const template = SPEC_TEMPLATES[selectedCatSlug];
        if (template) {
            setSpecs([...template]);
        }
    }

    function handleCategoryChange(catId: string) {
        const cat = categories.find(c => c.id === catId);
        if (cat) setSelectedCatSlug(cat.slug);
    }

    // Specs
    function addSpec() { setSpecs([...specs, { key: "", value: "" }]); }
    function removeSpec(i: number) { setSpecs(specs.filter((_, idx) => idx !== i)); }
    function updateSpec(i: number, field: "key" | "value", val: string) {
        const n = [...specs]; n[i][field] = val; setSpecs(n);
    }

    // Pros
    function addPro() { setPros([...pros, '']); }
    function removePro(i: number) { setPros(pros.filter((_, idx) => idx !== i)); }
    function updatePro(i: number, val: string) { const n = [...pros]; n[i] = val; setPros(n); }

    // Cons
    function addCon() { setCons([...cons, '']); }
    function removeCon(i: number) { setCons(cons.filter((_, idx) => idx !== i)); }
    function updateCon(i: number, val: string) { const n = [...cons]; n[i] = val; setCons(n); }

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const formData = new FormData();
            for (const key of Object.keys(data)) {
                if (data[key] != null && key !== 'pros' && key !== 'cons') {
                    formData.append(key, data[key]);
                }
            }
            // Append pros and cons as separate entries
            pros.filter(Boolean).forEach(p => formData.append("pros", p));
            cons.filter(Boolean).forEach(c => formData.append("cons", c));

            const res = await addProduct(formData);
            if (res.error) {
                alert(res.error);
            } else if (res.data && res.data[0]) {
                const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());
                if (validSpecs.length > 0) {
                    await saveProductSpecs(res.data[0].id, validSpecs);
                }
                router.push("/admin");
            } else {
                router.push("/admin");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">เพิ่มสินค้าใหม่</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name with auto-slug */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
                    <input
                        type="text"
                        {...register("name", { required: "กรุณากรอกชื่อสินค้า" })}
                        onChange={(e) => { handleNameChange(e.target.value); }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (สร้างอัตโนมัติ)</label>
                    <input
                        type="text"
                        {...register("slug", { required: "กรุณากรอก slug" })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-50"
                    />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{String(errors.slug.message)}</p>}
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">หมวดหมู่ *</label>
                    <select
                        {...register("category_id", { required: "กรุณาเลือกหมวดหมู่" })}
                        onChange={(e) => {
                            handleCategoryChange(e.target.value);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{String(errors.category_id.message)}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">📝 คำอธิบาย / รีวิวสินค้า</label>
                    <textarea
                        {...register("description")}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="เขียนรีวิว คำอธิบายสินค้า หรือจุดเด่นของสินค้า..."
                    />
                </div>

                {/* Prices */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">ราคาต่ำสุด (฿)</label>
                    <input type="number" step="0.01" {...register("price_min")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ราคาสูงสุด (฿)</label>
                    <input type="number" step="0.01" {...register("price_max")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>

                {/* Scores */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">คะแนนรวม (0-10)</label>
                    <input type="number" step="0.1" {...register("overall_score")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>

                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">คะแนนรายหมวด</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="block text-xs text-gray-700">🎵 Sound</label><input type="number" step="0.1" {...register("sound_score")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
                        <div><label className="block text-xs text-gray-700">🎮 FPS</label><input type="number" step="0.1" {...register("fps_score")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
                        <div><label className="block text-xs text-gray-700">💆 Comfort</label><input type="number" step="0.1" {...register("comfort_score")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
                        <div><label className="block text-xs text-gray-700">🔧 Build</label><input type="number" step="0.1" {...register("build_score")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" /></div>
                    </div>
                </div>

                {/* URLs */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">🖼️ รูปสินค้า (URL)</label>
                    <input type="url" {...register("image_url")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border placeholder:text-gray-300" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">🔗 Affiliate URL</label>
                    <input type="url" {...register("affiliate_url")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border placeholder:text-gray-300" placeholder="https://..." />
                </div>
            </div>

            {/* Dynamic Pros */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-green-700">✅ ข้อดี</label>
                    <button type="button" onClick={addPro} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium">
                        <Plus className="h-3.5 w-3.5" /> เพิ่มข้อดี
                    </button>
                </div>
                <div className="space-y-2 bg-green-50 rounded-lg p-3 border border-green-200">
                    {pros.length === 0 && <p className="text-xs text-gray-400 text-center py-2">ยังไม่มี กดปุ่ม "เพิ่มข้อดี"</p>}
                    {pros.map((pro, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <span className="text-green-600 text-sm font-bold w-6">{i + 1}.</span>
                            <input type="text" value={pro} onChange={(e) => updatePro(i, e.target.value)}
                                placeholder="เช่น เสียงดี เบสหนัก" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                            <button type="button" onClick={() => removePro(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Cons */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-red-700">❌ ข้อเสีย</label>
                    <button type="button" onClick={addCon} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium">
                        <Plus className="h-3.5 w-3.5" /> เพิ่มข้อเสีย
                    </button>
                </div>
                <div className="space-y-2 bg-red-50 rounded-lg p-3 border border-red-200">
                    {cons.length === 0 && <p className="text-xs text-gray-400 text-center py-2">ยังไม่มี กดปุ่ม "เพิ่มข้อเสีย"</p>}
                    {cons.map((con, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <span className="text-red-600 text-sm font-bold w-6">{i + 1}.</span>
                            <input type="text" value={con} onChange={(e) => updateCon(i, e.target.value)}
                                placeholder="เช่น ราคาแพง ไม่กันน้ำ" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                            <button type="button" onClick={() => removeCon(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Specs Editor with Template Button */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">📋 สเปคสินค้า</label>
                    <div className="flex gap-2">
                        {selectedCatSlug && SPEC_TEMPLATES[selectedCatSlug] && (
                            <button type="button" onClick={loadSpecTemplate}
                                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2 py-1 rounded">
                                <Sparkles className="h-3.5 w-3.5" /> โหลด Template
                            </button>
                        )}
                        <button type="button" onClick={addSpec}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <Plus className="h-3.5 w-3.5" /> เพิ่มสเปค
                        </button>
                    </div>
                </div>
                <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {specs.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                            {selectedCatSlug && SPEC_TEMPLATES[selectedCatSlug]
                                ? 'กดปุ่ม "โหลด Template" เพื่อเริ่มจาก Template หรือ "เพิ่มสเปค" เพื่อเพิ่มเอง'
                                : 'เลือกหมวดหมู่ก่อนเพื่อใช้ Template หรือกด "เพิ่มสเปค" เพื่อเพิ่มเอง'}
                        </p>
                    )}
                    {specs.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input type="text" value={spec.key} onChange={(e) => updateSpec(index, "key", e.target.value)}
                                placeholder="ชื่อสเปค" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                            <input type="text" value={spec.value} onChange={(e) => updateSpec(index, "value", e.target.value)}
                                placeholder="ค่า" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={() => removeSpec(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-5">
                <Button type="button" variant="outline" onClick={() => router.back()} className="mr-3">ยกเลิก</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "กำลังบันทึก..." : "💾 บันทึกสินค้า"}
                </Button>
            </div>
        </form>
    );
}
