"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { deleteProduct } from "@/app/actions/admin";
import { Pagination } from "@/components/Pagination";
import { useRouter } from "next/navigation";

interface AdminProductTableProps {
    products: any[];
    categories: any[];
}

const ITEMS_PER_PAGE = 20;

export default function AdminProductTable({ products, categories }: AdminProductTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filter products
    const filtered = useMemo(() => {
        let result = products;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
            );
        }

        if (selectedCategory) {
            result = result.filter(p => p.category_id === selectedCategory);
        }

        return result;
    }, [products, searchQuery, selectedCategory]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    // Reset page when filters change
    const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
    const handleCategoryChange = (catId: string) => { setSelectedCategory(catId); setCurrentPage(1); };

    // Delete handler
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ลบ "${name}" ?`)) return;
        setDeletingId(id);
        await deleteProduct(id);
        setDeletingId(null);
        router.refresh();
    };

    return (
        <div>
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">ทุกหมวดหมู่ ({products.length})</option>
                        {categories.map(c => {
                            const count = products.filter(p => p.category_id === c.id).length;
                            return count > 0 ? (
                                <option key={c.id} value={c.id}>{c.name} ({count})</option>
                            ) : null;
                        })}
                    </select>
                </div>
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-500 mb-2">
                {searchQuery || selectedCategory
                    ? `พบ ${filtered.length} รายการ`
                    : `ทั้งหมด ${products.length} รายการ`}
            </p>

            {/* Table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((p, idx) => (
                                <tr key={p.id} className={`hover:bg-gray-50 ${deletingId === p.id ? "opacity-50" : ""}`}>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-normal min-w-[200px] max-w-md">
                                        <Link href={`/product/${p.slug}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                            {p.name}
                                        </Link>
                                        <div className="text-xs text-gray-400 mt-0.5">{p.slug}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                            {p.categories?.name || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {p.overall_score || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                        {p.price_min ? `฿${p.price_min.toLocaleString()}` : "—"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/edit/${p.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                            แก้ไข
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(p.id, p.name)}
                                            disabled={deletingId === p.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        >
                                            {deletingId === p.id ? "กำลังลบ..." : "ลบ"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    {searchQuery || selectedCategory
                                        ? `ไม่พบสินค้าที่ค้นหา "${searchQuery}"`
                                        : "ยังไม่มีสินค้า กด + Add Product เพื่อเริ่มเพิ่ม"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}
