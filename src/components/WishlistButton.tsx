"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
    productId: string;
    productName: string;
}

export function WishlistButton({ productId, productName }: WishlistButtonProps) {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setSaved(wishlist.includes(productId));
    }, [productId]);

    function toggleWishlist() {
        const wishlist: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
        let newWishlist;
        if (wishlist.includes(productId)) {
            newWishlist = wishlist.filter((id) => id !== productId);
        } else {
            newWishlist = [...wishlist, productId];
        }
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
        setSaved(!saved);
        // Notify Header badge to update
        window.dispatchEvent(new Event("wishlist-updated"));
    }

    return (
        <button
            onClick={toggleWishlist}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${saved
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/40"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
        >
            <Heart className={`h-4 w-4 transition-colors ${saved ? "fill-red-500 text-red-500" : ""}`} />
            {saved ? "บันทึกแล้ว" : "บันทึกสินค้า"}
        </button>
    );
}
