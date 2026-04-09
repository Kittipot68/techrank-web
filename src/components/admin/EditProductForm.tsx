"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, saveProductSpecs } from "@/app/actions/admin";
import { Plus, Trash2 } from "lucide-react";

interface EditProductFormProps {
    product: any;
    categories: any[];
    specs: { id: string; key: string; value: string }[];
}

export default function EditProductForm({ product, categories, specs: initialSpecs }: EditProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
        initialSpecs.length > 0 ? initialSpecs.map(s => ({ key: s.key, value: s.value })) : []
    );
    const [pros, setPros] = useState<string[]>(product.pros?.length > 0 ? product.pros : ['']);
    const [cons, setCons] = useState<string[]>(product.cons?.length > 0 ? product.cons : ['']);

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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        const formEl = e.currentTarget;
        const formData = new FormData();

        // Manually collect non-pros/cons fields
        const fields = ['category_id', 'name', 'slug', 'description', 'price_min', 'price_max',
            'overall_score', 'sound_score', 'fps_score', 'comfort_score', 'build_score',
            'image_url', 'affiliate_url'];
        for (const f of fields) {
            const input = formEl.querySelector(`[name="${f}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            if (input && input.value) formData.append(f, input.value);
        }

        // Append dynamic pros/cons
        pros.filter(Boolean).forEach(p => formData.append("pros", p));
        cons.filter(Boolean).forEach(c => formData.append("cons", c));

        const result = await updateProduct(product.id, formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // Save specs
        const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());
        await saveProductSpecs(product.id, validSpecs);

        setSuccess(true);
        setLoading(false);
        setTimeout(() => router.push("/admin"), 1000);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                    ❌ {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
                    ✅ อัปเดตสำเร็จ! กำลังกลับไปหน้า Dashboard...
                </div>
            )}

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
                <select name="category_id" defaultValue={product.category_id} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Name & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
                    <input name="name" defaultValue={product.name} required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input name="slug" defaultValue={product.slug} required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 คำอธิบาย / รีวิวสินค้า</label>
                <textarea name="description" rows={4} defaultValue={product.description || ""}
                    placeholder="เขียนรีวิว คำอธิบายสินค้า หรือจุดเด่นของสินค้า..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ราคาต่ำสุด (฿)</label>
                    <input name="price_min" type="number" defaultValue={product.price_min || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ราคาสูงสุด (฿)</label>
                    <input name="price_max" type="number" defaultValue={product.price_max || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            {/* Scores */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คะแนน (0-10)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { name: "overall_score", label: "⭐ Overall" },
                        { name: "sound_score", label: "🎵 Sound" },
                        { name: "fps_score", label: "🎮 FPS" },
                        { name: "comfort_score", label: "💆 Comfort" },
                        { name: "build_score", label: "🔧 Build" },
                    ].map((s) => (
                        <div key={s.name}>
                            <label className="block text-xs text-gray-500 mb-1">{s.label}</label>
                            <input name={s.name} type="number" step="0.1" min="0" max="10"
                                defaultValue={(product as any)[s.name] || ""}
                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ รูปสินค้า (อัพโหลด หรือ URL)</label>
                    <div className="flex gap-2 items-center flex-wrap">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const fileInput = e.target;
                                    const urlInput = fileInput.nextElementSibling?.nextElementSibling as HTMLInputElement;
                                    if (urlInput) urlInput.value = "กำลังอัพโหลด...";
                                    
                                    const formData = new FormData();
                                    formData.append('file', e.target.files[0]);
                                    
                                    try {
                                        const { uploadImage } = await import('@/app/actions/upload');
                                        const res = await uploadImage(formData);
                                        if (res.url && urlInput) {
                                            urlInput.value = res.url;
                                        } else {
                                            alert(res.error || "Upload failed");
                                            if (urlInput) urlInput.value = "";
                                        }
                                    } catch (err) {
                                        alert("Upload failed");
                                        if (urlInput) urlInput.value = "";
                                    }
                                }
                            }}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <span className="text-sm text-gray-500">หรือ</span>
                        <input name="image_url" type="url" defaultValue={product.image_url || ""}
                            className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="กรอก URL..." />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🔗 Affiliate URL</label>
                    <input name="affiliate_url" type="url" defaultValue={product.affiliate_url || ""}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
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

            {/* Specs Editor */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">📋 สเปคสินค้า</label>
                    <button type="button" onClick={addSpec}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        <Plus className="h-3.5 w-3.5" /> เพิ่มสเปค
                    </button>
                </div>
                <div className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {specs.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">ยังไม่มีสเปค กดปุ่ม "เพิ่มสเปค" เพื่อเริ่มเพิ่ม</p>
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

            {/* Submit */}
            <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                    {loading ? "กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
                </button>
                <button type="button" onClick={() => router.push("/admin")}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}
