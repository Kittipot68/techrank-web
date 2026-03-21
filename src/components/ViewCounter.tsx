"use client";

import { useEffect } from "react";
import { Eye } from "lucide-react";
import { incrementViewCount } from "@/app/actions/engagement";

interface ViewCounterProps {
    productId: string;
    initialCount: number;
}

export function ViewCounter({ productId, initialCount }: ViewCounterProps) {
    useEffect(() => {
        // Increment view only once per session per product
        const key = `viewed_${productId}`;
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            incrementViewCount(productId);
        }
    }, [productId]);

    return (
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Eye className="h-4 w-4" />
            <span>{(initialCount + 1).toLocaleString()} คนดูสินค้านี้</span>
        </div>
    );
}
