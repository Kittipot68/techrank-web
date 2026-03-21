'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRightLeft, Filter, Check, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SimpleProduct {
    id: string
    name: string
    slug: string
    category_id: string
}

interface Category {
    id: string
    name: string
    slug: string
}

interface CompareSelectorProps {
    products: SimpleProduct[]
    categories: Category[]
}

function ProductListBox({
    label,
    searchValue,
    onSearchChange,
    products,
    selectedId,
    onSelect,
}: {
    label: string
    searchValue: string
    onSearchChange: (v: string) => void
    products: SimpleProduct[]
    selectedId: string
    onSelect: (id: string) => void
}) {
    const selectedProduct = products.find(p => p.id === selectedId)

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{label}</h4>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    {products.length} รายการ
                </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Selected indicator */}
            {selectedProduct && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300 truncate">{selectedProduct.name}</span>
                </div>
            )}

            {/* Product List */}
            <div className="flex-1 border-2 border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                <div className="overflow-y-auto max-h-[320px] divide-y divide-slate-100 dark:divide-slate-700">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                            <Package className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">ไม่พบสินค้า</p>
                        </div>
                    ) : (
                        products.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onSelect(p.id)}
                                className={`w-full text-left px-4 py-3.5 text-sm transition-all duration-150 flex items-center gap-3 group ${selectedId === p.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedId === p.id
                                    ? 'border-white bg-white'
                                    : 'border-slate-300 dark:border-slate-500 group-hover:border-blue-400'
                                    }`}>
                                    {selectedId === p.id && (
                                        <Check className="h-3 w-3 text-blue-600" />
                                    )}
                                </div>
                                <span className="truncate font-medium">{p.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export function CompareSelector({ products, categories }: CompareSelectorProps) {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedProduct1, setSelectedProduct1] = useState<string>('')
    const [selectedProduct2, setSelectedProduct2] = useState<string>('')
    const [search1, setSearch1] = useState('')
    const [search2, setSearch2] = useState('')

    // Filter products by selected category
    const filteredProducts = useMemo(() => {
        let filtered = products
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category_id === selectedCategory)
        }
        return filtered
    }, [products, selectedCategory])

    // Search filter for each dropdown
    const searchedProducts1 = useMemo(() => {
        if (!search1) return filteredProducts
        return filteredProducts.filter(p => p.name.toLowerCase().includes(search1.toLowerCase()))
    }, [filteredProducts, search1])

    const searchedProducts2 = useMemo(() => {
        if (!search2) return filteredProducts
        return filteredProducts.filter(p => p.name.toLowerCase().includes(search2.toLowerCase()))
    }, [filteredProducts, search2])

    // Count products per category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        products.forEach(p => {
            counts[p.category_id] = (counts[p.category_id] || 0) + 1
        })
        return counts
    }, [products])

    const handleCompare = () => {
        if (selectedProduct1 && selectedProduct2) {
            const p1 = products.find(p => p.id === selectedProduct1)
            const p2 = products.find(p => p.id === selectedProduct2)
            if (p1 && p2) {
                router.push(`/compare/${p1.slug}-vs-${p2.slug}`)
            }
        }
    }

    // Reset selections when category changes
    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId)
        setSelectedProduct1('')
        setSelectedProduct2('')
        setSearch1('')
        setSearch2('')
    }

    const canCompare = selectedProduct1 && selectedProduct2 && selectedProduct1 !== selectedProduct2

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Category Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">เลือกหมวดหมู่</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${!selectedCategory
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-sm'
                            }`}
                    >
                        ทั้งหมด ({products.length})
                    </button>
                    {categories.filter(c => categoryCounts[c.id] > 0).map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-sm'
                                }`}
                        >
                            {cat.name} ({categoryCounts[cat.id] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Selectors - Side by Side */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {/* Product 1 */}
                    <ProductListBox
                        label="🅰️ สินค้าตัวที่ 1"
                        searchValue={search1}
                        onSearchChange={setSearch1}
                        products={searchedProducts1}
                        selectedId={selectedProduct1}
                        onSelect={setSelectedProduct1}
                    />

                    {/* Product 2 */}
                    <ProductListBox
                        label="🅱️ สินค้าตัวที่ 2"
                        searchValue={search2}
                        onSearchChange={setSearch2}
                        products={searchedProducts2}
                        selectedId={selectedProduct2}
                        onSelect={setSelectedProduct2}
                    />
                </div>

                {/* VS Badge between columns on mobile */}
                <div className="flex items-center justify-center my-2 md:hidden">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-slate-200 dark:bg-slate-600"></div>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">VS</span>
                        <div className="h-px w-12 bg-slate-200 dark:bg-slate-600"></div>
                    </div>
                </div>

                {/* Compare Button */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <Button
                        className={`w-full h-14 text-base font-semibold rounded-xl transition-all duration-200 ${canCompare
                            ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30'
                            : ''
                            }`}
                        size="lg"
                        disabled={!canCompare}
                        onClick={handleCompare}
                    >
                        <ArrowRightLeft className="mr-2.5 h-5 w-5" /> เปรียบเทียบเลย
                    </Button>
                    {selectedProduct1 && selectedProduct2 && selectedProduct1 === selectedProduct2 && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-3 text-center font-medium">⚠️ กรุณาเลือกสินค้าคนละตัว</p>
                    )}
                    {!selectedProduct1 && !selectedProduct2 && (
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-3 text-center">เลือกสินค้า 2 ชิ้นจากรายการด้านบนเพื่อเปรียบเทียบ</p>
                    )}
                </div>
            </div>
        </div>
    )
}
