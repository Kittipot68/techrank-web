"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WishlistProduct {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    price_min: number | null;
    overall_score: number | null;
    affiliate_url: string | null;
    categories?: { name: string } | null;
}

export default function WishlistPage() {
    const [products, setProducts] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    async function loadWishlist() {
        try {
            const wishlist: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
            if (wishlist.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            // Fetch product details from API
            const res = await fetch(`/api/wishlist?ids=${wishlist.join(",")}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error("Failed to load wishlist:", e);
        }
        setLoading(false);
    }

    function removeItem(productId: string) {
        const wishlist: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const updated = wishlist.filter(id => id !== productId);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        setProducts(prev => prev.filter(p => p.id !== productId));
        // Dispatch event so Header badge updates
        window.dispatchEvent(new Event("wishlist-updated"));
    }



    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-pulse text-slate-400 dark:text-slate-500">กำลังโหลด...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart className="h-7 w-7 text-red-500 fill-red-500" />
                        สินค้าที่บันทึกไว้
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        {products.length > 0 ? `${products.length} รายการ` : "ยังไม่มีรายการ"}
                    </p>
                </div>

            </div>

            {products.length > 0 ? (
                <div className="space-y-4">
                    {products.map(product => (
                        <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                            {/* Image */}
                            <Link href={`/product/${product.slug}`} className="w-full sm:w-28 sm:h-28 aspect-square bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm group/wish">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover/wish:scale-110" />
                                ) : (
                                    <span className="text-3xl text-slate-300">📦</span>
                                )}
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                {product.categories && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{product.categories.name}</span>
                                )}
                                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                    <Link href={`/product/${product.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {product.name}
                                    </Link>
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                    {product.overall_score && (
                                        <span className="flex items-center gap-1 text-sm">
                                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{product.overall_score}</span>
                                        </span>
                                    )}
                                    {product.price_min && (
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            ฿{product.price_min.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                {product.affiliate_url && (
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-xs gap-1 flex-1 sm:flex-none" asChild>
                                        <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                                            ดูราคา <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none">
                                    <Link href={`/product/${product.slug}`}>รายละเอียด</Link>
                                </Button>
                                <button
                                    onClick={() => removeItem(product.id)}
                                    className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="ลบออก"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-slate-200 dark:text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">ยังไม่มีสินค้าที่บันทึก</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">กดปุ่ม &quot;💜 บันทึกสินค้า&quot; ในหน้ารายละเอียดสินค้าเพื่อเก็บไว้ดูภายหลัง</p>
                    <Button asChild>
                        <Link href="/" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            ดูสินค้าทั้งหมด
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
