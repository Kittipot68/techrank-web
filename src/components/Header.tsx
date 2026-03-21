"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Menu, Search, X, ChevronRight, Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";

const NAV_CATEGORIES = [
    { name: "Headphones", href: "/category/headphones" },
    { name: "Gaming Gear", href: "/category/gaming-gear" },
    { name: "Keyboards", href: "/category/keyboards" },
    { name: "Mice", href: "/category/mice" },
    { name: "Monitors", href: "/category/monitors" },
    { name: "Earbuds", href: "/category/earbuds" },
    { name: "Laptops", href: "/category/laptops" },
    { name: "Smartphones", href: "/category/smartphones" },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);

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
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Link href="/category/headphones" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">หูฟัง</Link>
                        <Link href="/category/gaming-gear" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">อุปกรณ์เกมมิ่ง</Link>
                        <Link href="/compare" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">เปรียบเทียบ</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
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
                        <nav className="container mx-auto px-4 py-4 space-y-1">
                            {NAV_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.href}
                                    href={cat.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {cat.name}
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </Link>
                            ))}
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
