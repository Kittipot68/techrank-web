"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Product {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    overall_score: number | null;
    price_min: number | null;
    categories?: { name: string; slug: string } | null;
}

interface FeaturedSliderProps {
    products: Product[];
}

export function FeaturedSlider({ products }: FeaturedSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const next = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    }, [products.length]);

    const prev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }, [products.length]);

    // Auto-advance every 4 seconds
    useEffect(() => {
        if (!isAutoPlaying || products.length <= 1) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, next, products.length]);

    if (products.length === 0) return null;

    const product = products[currentIndex];

    return (
        <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[300px] md:min-h-[380px]">
                {/* Product Image */}
                <Link href={`/product/${product.slug}`} className="relative flex items-center justify-center m-6 md:m-8 lg:m-12 bg-white rounded-3xl overflow-hidden group/slider-img shadow-xl shadow-black/20 aspect-[4/3] md:aspect-auto md:h-[280px] lg:h-[320px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100/50 pointer-events-none" />
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain p-6 md:p-8 transition-transform duration-500 group-hover/slider-img:scale-110"
                        />
                    ) : (
                        <div className="text-6xl opacity-50">📦</div>
                    )}
                </Link>

                {/* Product Info */}
                <div className="flex flex-col justify-center p-6 md:p-10 text-white">
                    {product.categories && (
                        <span className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-2">
                            {product.categories.name}
                        </span>
                    )}
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-3">
                        <Link href={`/product/${product.slug}`} className="hover:text-blue-300 transition-colors">
                            {product.name}
                        </Link>
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                        {product.overall_score && (
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-lg">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-lg">{product.overall_score}</span>
                                <span className="text-xs text-white/60">/10</span>
                            </div>
                        )}
                        {product.price_min && (
                            <span className="text-lg font-semibold text-blue-200">
                                ฿{product.price_min.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <Link
                        href={`/product/${product.slug}`}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-fit"
                    >
                        ดูรายละเอียด
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}

            {/* Dots */}
            {products.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {products.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
