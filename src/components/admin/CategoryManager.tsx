"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCategory } from "@/app/actions/admin";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import Link from "next/link";

interface CategoryManagerProps {
    categories: { id: string; name: string; slug: string; created_at: string }[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
    const router = useRouter();
    const [showAdd, setShowAdd] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function generateSlug(value: string) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    async function handleAdd() {
        if (!name.trim() || !slug.trim()) {
            setError("กรุณากรอกชื่อและ slug");
            return;
        }
        setLoading(true);
        setError("");
        const result = await addCategory(name.trim(), slug.trim());
        if (result.error) {
            setError(result.error);
        } else {
            setName("");
            setSlug("");
            setShowAdd(false);
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    📂 หมวดหมู่ ({categories.length})
                </h2>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <FolderPlus className="h-4 w-4" />
                    เพิ่มหมวดหมู่
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
                    {error && (
                        <div className="text-red-600 text-sm mb-2 bg-red-50 px-3 py-1.5 rounded">❌ {error}</div>
                    )}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อหมวดหมู่</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setSlug(generateSlug(e.target.value));
                                }}
                                placeholder="เช่น Tablets, Smartwatches"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="tablets"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 shrink-0"
                        >
                            {loading ? "กำลังเพิ่ม..." : "✅ เพิ่ม"}
                        </button>
                        <button
                            onClick={() => { setShowAdd(false); setError(""); }}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                            ยกเลิก
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Slug จะถูกใช้เป็น URL เช่น /category/tablets — ใช้ภาษาอังกฤษ ตัวเล็ก คั่นด้วย -
                    </p>
                </div>
            )}

            {/* Categories List */}
            <div className="divide-y divide-gray-100">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                            <span className="text-xs text-gray-400 ml-2">/{cat.slug}</span>
                        </div>
                        <Link
                            href={`/category/${cat.slug}`}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            ดูหน้าเว็บ →
                        </Link>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className="px-6 py-8 text-center text-gray-400">
                        ยังไม่มีหมวดหมู่ กดปุ่ม "เพิ่มหมวดหมู่" เพื่อเริ่มต้น
                    </div>
                )}
            </div>
        </div>
    );
}
