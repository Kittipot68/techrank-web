"use client";

import { useState, useTransition } from "react";
import { scrapeShopeeAuto, type ScrapedProduct } from "@/app/actions/scraper";
import { addProduct } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ScraperForm({ categories }: { categories: any[] }) {
    const [url, setUrl] = useState("");
    const [singleProduct, setSingleProduct] = useState<ScrapedProduct | null>(null);
    const [multiProducts, setMultiProducts] = useState<ScrapedProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [savingId, setSavingId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
    const router = useRouter();

    const handleScrape = () => {
        setError(null);
        setSingleProduct(null);
        setMultiProducts([]);
        setSavedItems(new Set());

        startTransition(async () => {
            const res = await scrapeShopeeAuto(url);

            if (res.error) {
                setError(res.error);
            } else if (res.type === "single" && res.single) {
                setSingleProduct(res.single);
            } else if (res.type === "multiple" && res.multiple) {
                setMultiProducts(res.multiple);
            }
        });
    };

    const generateSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9ก-๛]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .substring(0, 80);

    const handleSave = async (product: ScrapedProduct) => {
        if (!selectedCategory) {
            alert("กรุณาเลือกหมวดหมู่ก่อน!");
            return;
        }

        setSavingId(product.name);

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("slug", generateSlug(product.name));
        formData.append("category_id", selectedCategory);
        if (product.price_min) formData.append("price_min", String(product.price_min));
        if (product.price_max) formData.append("price_max", String(product.price_max));
        if (product.image_url) formData.append("image_url", product.image_url);
        if (product.url) formData.append("affiliate_url", product.url);

        const res = await addProduct(formData);
        setSavingId(null);

        if (res.error) {
            alert("Error: " + res.error);
        } else {
            setSavedItems((prev) => new Set(prev).add(product.name));
        }
    };

    const handleSaveAll = async () => {
        if (!selectedCategory) {
            alert("กรุณาเลือกหมวดหมู่ก่อน!");
            return;
        }

        for (const p of multiProducts) {
            if (savedItems.has(p.name)) continue;
            await handleSave(p);
            await new Promise((r) => setTimeout(r, 300));
        }
        alert("บันทึกสินค้าทั้งหมดเสร็จแล้ว!");
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-2">🔍 วาง URL Shopee</h2>
                <p className="text-sm text-gray-500 mb-4">
                    รองรับทั้ง URL สินค้าเดี่ยว, หน้าหมวดหมู่, หน้าสินค้าขายดี, และหน้าค้นหา
                </p>
                <div className="flex gap-3">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://shopee.co.th/..."
                        className="flex-1 rounded-md border border-gray-300 shadow-sm p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={isPending}
                    />
                    <Button onClick={handleScrape} disabled={isPending || !url}>
                        {isPending ? "กำลังดึง..." : "Scrape"}
                    </Button>
                </div>

                {/* Example URLs */}
                <div className="mt-3 text-xs text-gray-400 space-y-1">
                    <p>ตัวอย่าง URL ที่ใช้ได้:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>สินค้าเดี่ยว: <code>https://shopee.co.th/Product-Name-i.123456.789012</code></li>
                        <li>สินค้าขายดี: <code>https://shopee.co.th/top_products?catId=...</code></li>
                        <li>หมวดหมู่: <code>https://shopee.co.th/หูฟัง-cat.11043625</code></li>
                        <li>ค้นหา: <code>https://shopee.co.th/search?keyword=headphones</code></li>
                    </ul>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">❌ {error}</p>
                    </div>
                )}
            </div>

            {/* Category Selector (show when we have results) */}
            {(singleProduct || multiProducts.length > 0) && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3">💾 เลือกหมวดหมู่ก่อนบันทึก</h3>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full max-w-md rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                    >
                        <option value="">-- เลือกหมวดหมู่ --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Single Product Preview */}
            {singleProduct && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">📦 ผลลัพธ์สินค้า</h2>
                    <ProductCard
                        product={singleProduct}
                        onSave={() => handleSave(singleProduct)}
                        isSaving={savingId === singleProduct.name}
                        isSaved={savedItems.has(singleProduct.name)}
                    />
                </div>
            )}

            {/* Multiple Products Preview */}
            {multiProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">📦 พบ {multiProducts.length} สินค้า</h2>
                        <Button onClick={handleSaveAll} disabled={!selectedCategory}>
                            บันทึกทั้งหมด ({multiProducts.length})
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {multiProducts.map((p, idx) => (
                            <ProductCard
                                key={`${p.name}-${idx}`}
                                product={p}
                                onSave={() => handleSave(p)}
                                isSaving={savingId === p.name}
                                isSaved={savedItems.has(p.name)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for a single product card
function ProductCard({
    product,
    onSave,
    isSaving,
    isSaved,
}: {
    product: ScrapedProduct;
    onSave: () => void;
    isSaving: boolean;
    isSaved: boolean;
}) {
    return (
        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            {product.image_url ? (
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-contain bg-gray-50"
                />
            ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                </div>
            )}

            {/* Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2" title={product.name}>
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 text-sm">
                    {product.price_min !== null && (
                        <span className="font-bold text-orange-600">
                            ฿{product.price_min.toLocaleString()}
                        </span>
                    )}
                    {product.price_max !== null && product.price_max !== product.price_min && (
                        <span className="text-gray-400">
                            - ฿{product.price_max.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {product.rating !== null && <span>⭐ {product.rating}</span>}
                    {product.sold && <span>{product.sold}</span>}
                    {product.shop_name && <span>🏪 {product.shop_name}</span>}
                </div>

                {/* Save Button */}
                <div className="pt-2">
                    {isSaved ? (
                        <span className="text-green-600 text-sm font-medium">✅ บันทึกแล้ว</span>
                    ) : (
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="w-full py-2 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? "กำลังบันทึก..." : "บันทึกลง Database"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
