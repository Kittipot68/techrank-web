"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
    mainImage: string | null;
    images?: string[] | null;
    productName: string;
}

export function ProductImageGallery({ mainImage, images, productName }: ProductImageGalleryProps) {
    // รวมรูปทั้งหมด: image_url + images[] โดยเอาซ้ำออก
    const allImages = Array.from(
        new Set([
            ...(mainImage ? [mainImage] : []),
            ...(images || []),
        ])
    ).filter(Boolean);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const hasMultiple = allImages.length > 1;
    const currentImage = allImages[activeIndex] || null;

    function prev() {
        setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
    }
    function next() {
        setActiveIndex((i) => (i + 1) % allImages.length);
    }

    if (allImages.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <div className="text-center text-slate-400">
                    <div className="text-6xl mb-3 opacity-40">📦</div>
                    <span className="text-sm font-medium">รูปภาพเร็วๆ นี้</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group">
                {/* รูปหลัก */}
                <img
                    src={currentImage!}
                    alt={`${productName} รูปที่ ${activeIndex + 1}`}
                    className={`w-full h-full object-contain p-6 transition-all duration-500 ${
                        isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in group-hover:scale-105"
                    }`}
                    onClick={() => setIsZoomed((z) => !z)}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />

                {/* ปุ่มนำทาง (แสดงเมื่อมีหลายรูป) */}
                {hasMultiple && !isZoomed && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="รูปก่อนหน้า"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="รูปถัดไป"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Badge ตำแหน่งรูป */}
                {hasMultiple && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {activeIndex + 1} / {allImages.length}
                    </div>
                )}

                {/* ไอคอน Zoom */}
                {!isZoomed && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
                            <ZoomIn className="h-3.5 w-3.5" />
                        </div>
                    </div>
                )}

                {/* Overlay ปิด zoom */}
                {isZoomed && (
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsZoomed(false)}
                    />
                )}
            </div>

            {/* Thumbnail Strip (แสดงเมื่อมีมากกว่า 1 รูป) */}
            {hasMultiple && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {allImages.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveIndex(i);
                                setIsZoomed(false);
                            }}
                            className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white dark:bg-slate-800 transition-all ${
                                i === activeIndex
                                    ? "border-blue-500 dark:border-blue-400 shadow-md scale-105"
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 opacity-70 hover:opacity-100"
                            }`}
                            aria-label={`ดูรูปที่ ${i + 1}`}
                        >
                            <img
                                src={img}
                                alt={`${productName} thumbnail ${i + 1}`}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).parentElement!.style.display = "none";
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
