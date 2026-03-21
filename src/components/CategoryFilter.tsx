"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, SlidersHorizontal, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";

type SortOption = "score-desc" | "score-asc" | "price-asc" | "price-desc" | "name-asc";

interface CategoryFilterProps {
    products: any[];
}

const ITEMS_PER_PAGE = 12;

export function CategoryFilter({ products }: CategoryFilterProps) {
    const [sort, setSort] = useState<SortOption>("score-desc");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredAndSorted = useMemo(() => {
        let result = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q));
        }

        // Price filter
        if (priceMin) {
            result = result.filter((p) => (p.price_min || 0) >= Number(priceMin));
        }
        if (priceMax) {
            result = result.filter((p) => (p.price_min || Infinity) <= Number(priceMax));
        }

        // Sort
        switch (sort) {
            case "score-desc":
                result.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
                break;
            case "score-asc":
                result.sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0));
                break;
            case "price-asc":
                result.sort((a, b) => (a.price_min || 0) - (b.price_min || 0));
                break;
            case "price-desc":
                result.sort((a, b) => (b.price_min || 0) - (a.price_min || 0));
                break;
            case "name-asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return result;
    }, [products, sort, priceMin, priceMax, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAndSorted, currentPage]);

    // Reset page when filters change
    const handleSearchChange = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
    const handleSortChange = (s: SortOption) => { setSort(s); setCurrentPage(1); };
    const handleClearFilters = () => { setPriceMin(""); setPriceMax(""); setSearchQuery(""); setCurrentPage(1); };

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
                    <p className="text-sm text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block">
                        {filteredAndSorted.length} สินค้า
                    </p>
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
                                onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
                                placeholder="0"
                                className="w-32 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ราคาสูงสุด (฿)</label>
                            <input
                                type="number"
                                value={priceMax}
                                onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} rank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1} />
                ))}
            </div>

            {filteredAndSorted.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    ไม่พบสินค้าตามเงื่อนไขที่เลือก
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAndSorted.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}
