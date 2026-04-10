"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";

type SortOption = "score-desc" | "score-asc" | "price-asc" | "price-desc" | "name-asc";

interface CategoryFilterProps {
    products: any[];
    totalItems: number;
    currentPage: number;
}

const ITEMS_PER_PAGE = 12;

export function CategoryFilter({ products, totalItems, currentPage }: CategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [showFilters, setShowFilters] = useState(false);

    // Get current values from URL
    const sort = (searchParams.get("sort") as SortOption) || "score-desc";
    const priceMin = searchParams.get("min") || "";
    const priceMax = searchParams.get("max") || "";
    const searchQuery = searchParams.get("q") || "";

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const updateQuery = (params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "") {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        // Always reset to page 1 when filters/sort change
        if (!params.page) newParams.delete("page");
        
        startTransition(() => {
            router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
        });
    };

    const handleSearchChange = (q: string) => updateQuery({ q });
    const handleSortChange = (s: SortOption) => updateQuery({ sort: s });
    const handlePriceChange = (min: string, max: string) => updateQuery({ min, max });
    const handlePageChange = (p: number) => updateQuery({ page: p.toString() });
    const handleClearFilters = () => {
        const newParams = new URLSearchParams();
        router.push(pathname, { scroll: false });
    };

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                        {isPending && <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                        <p className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                            {totalItems} สินค้า
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        กรอง
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <ArrowUpDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <select
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value as SortOption)}
                            className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300"
                        >
                            <option value="score-desc" className="bg-white dark:bg-slate-800">คะแนนสูงสุด</option>
                            <option value="score-asc" className="bg-white dark:bg-slate-800">คะแนนต่ำสุด</option>
                            <option value="price-asc" className="bg-white dark:bg-slate-800">ราคาต่ำ → สูง</option>
                            <option value="price-desc" className="bg-white dark:bg-slate-800">ราคาสูง → ต่ำ</option>
                            <option value="name-asc" className="bg-white dark:bg-slate-800">ชื่อ A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ราคาต่ำสุด (฿)</label>
                            <input
                                type="number"
                                value={priceMin}
                                onChange={(e) => handlePriceChange(e.target.value, priceMax)}
                                placeholder="0"
                                className="w-32 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ราคาสูงสุด (฿)</label>
                            <input
                                type="number"
                                value={priceMax}
                                onChange={(e) => handlePriceChange(priceMin, e.target.value)}
                                placeholder="99999"
                                className="w-32 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isPending ? "opacity-40" : "opacity-100"}`}>
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} rank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1} />
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    ไม่พบสินค้าตามเงื่อนไขที่เลือก
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}
