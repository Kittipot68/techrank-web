"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bot, Menu, Search, X, ChevronRight, Heart, ChevronDown, Layers } from "lucide-react";
import { Button } from "./ui/Button";
import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";
import { Category } from "@/lib/queries";

interface HeaderProps {
    categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [catOpen, setCatOpen] = useState(false);
    const catTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Filter categories that actually have names
    const displayCategories = categories.filter(c => c.name).sort((a, b) => a.name.localeCompare(b.name));

    // Load and listen for wishlist changes
    useEffect(() => {
        function updateCount() {
            try {
                const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
                setWishlistCount(wishlist.length);
            } catch { setWishlistCount(0); }
        }
        updateCount();
        window.addEventListener("wishlist-updated", updateCount);
        window.addEventListener("storage", updateCount);
        return () => {
            window.removeEventListener("wishlist-updated", updateCount);
            window.removeEventListener("storage", updateCount);
        };
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0 text-slate-900 dark:text-white">
                        <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span>TechRank</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {/* Dynamic Category Dropdown */}
                        <div 
                            className="relative group h-16 flex items-center"
                            onMouseEnter={() => {
                                if (catTimeoutRef.current) clearTimeout(catTimeoutRef.current);
                                setCatOpen(true);
                            }}
                            onMouseLeave={() => {
                                catTimeoutRef.current = setTimeout(() => setCatOpen(false), 200);
                            }}
                        >
                            <button 
                                className={`flex items-center gap-1 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${catOpen ? "text-blue-600 dark:text-blue-400" : ""}`}
                                onClick={() => setCatOpen(!catOpen)}
                            >
                                <Layers className="h-4 w-4" />
                                หมวดหมู่
                                <ChevronDown className={`h-3 w-3 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                            </button>

                            {catOpen && (
                                <div className="absolute top-full left-0 w-[480px] mt-0 py-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-6">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">เลือกดูตามหมวดหมู่</div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                            {displayCategories.length > 0 ? (
                                                displayCategories.map((cat) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/category/${cat.slug}`}
                                                        className="flex items-center justify-between group/item py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        onClick={() => setCatOpen(false)}
                                                    >
                                                        <span className="text-[13.5px] font-medium">{cat.name}</span>
                                                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-blue-500" />
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-sm text-slate-400 italic">ยังไม่มีหมวดหมู่</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/compare" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
                            เปรียบเทียบ
                        </Link>
                    </nav>

                    {/* Desktop Search Bar (Persistent) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div 
                            className="relative w-full group cursor-pointer"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <div className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent group-hover:border-blue-500/30 rounded-full text-sm text-slate-500 dark:text-slate-400 transition-all flex items-center justify-between">
                                <span>ค้นหาสินค้า หรือหมวดหมู่...</span>
                                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Wishlist Button */}
                        <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="สินค้าที่บันทึก">
                            <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "text-red-500 fill-red-500" : "text-slate-500 dark:text-slate-400"}`} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                                    {wishlistCount > 99 ? "99+" : wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-200">
                        <nav className="container mx-auto px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1 uppercase tracking-wider">
                                หมวดหมู่สินค้า
                            </div>
                            {displayCategories.length > 0 ? (
                                displayCategories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {cat.name}
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </Link>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-xs text-slate-400 italic">ยังไม่มีหมวดหมู่</div>
                            )}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-2 space-y-1">
                                <Link
                                    href="/compare"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    เปรียบเทียบสินค้า
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </Link>
                                <Link
                                    href="/wishlist"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                >
                                    <span className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 fill-red-500" />
                                        สินค้าที่บันทึก
                                        {wishlistCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-red-400" />
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
