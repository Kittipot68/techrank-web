"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { searchProducts } from "@/app/actions/search";

interface SearchResult {
    id: string;
    name: string;
    slug: string;
    price_min: number | null;
    image_url: string | null;
    overall_score: number | null;
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = "hidden";
        } else {
            setQuery("");
            setResults([]);
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (query.trim().length < 2) { setResults([]); return; }

        timerRef.current = setTimeout(async () => {
            setLoading(true);
            const data = await searchProducts(query);
            setResults(data);
            setLoading(false);
        }, 300);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ค้นหาสินค้า..."
                        className="flex-1 text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent text-slate-900 dark:text-white"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="py-2">
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.slug}`}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-white border border-slate-100 dark:border-slate-700 shadow-sm rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-full h-full object-contain p-1.5" />
                                        ) : (
                                            <Search className="h-4 w-4 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 dark:text-white truncate">{product.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {product.price_min ? `฿${product.price_min.toLocaleString()}` : ""}
                                            {product.overall_score && (
                                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">★ {product.overall_score}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : query.length >= 2 && !loading ? (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                            ไม่พบสินค้า &quot;{query}&quot;
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                            พิมพ์ชื่อสินค้าเพื่อค้นหา
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
