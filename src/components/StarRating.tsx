"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { rateProduct, getProductRating } from "@/app/actions/engagement";

interface StarRatingProps {
    productId: string;
}

function generateFingerprint(): string {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    const screen = typeof window !== "undefined" ? window.screen : null;
    const raw = [
        nav?.userAgent || "",
        nav?.language || "",
        screen?.width || 0,
        screen?.height || 0,
        new Date().getTimezoneOffset(),
    ].join("|");
    // Simple hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}

export function StarRating({ productId }: StarRatingProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [average, setAverage] = useState(0);
    const [count, setCount] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        getProductRating(productId).then((r) => {
            setAverage(r.average);
            setCount(r.count);
        });
        // Check if user already rated
        const rated = localStorage.getItem(`rated_${productId}`);
        if (rated) {
            setRating(parseInt(rated));
            setSubmitted(true);
        }
    }, [productId]);

    async function handleRate(value: number) {
        if (submitted) return;
        setRating(value);
        setSubmitted(true);
        localStorage.setItem(`rated_${productId}`, value.toString());

        const fp = generateFingerprint();
        await rateProduct(productId, value, fp);

        const updated = await getProductRating(productId);
        setAverage(updated.average);
        setCount(updated.count);
    }

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">คุณให้คะแนนสินค้านี้เท่าไร?</h3>
            <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => !submitted && setHover(star)}
                        onMouseLeave={() => !submitted && setHover(0)}
                        disabled={submitted}
                        className={`transition-transform ${submitted ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
                    >
                        <Star
                            className={`h-7 w-7 transition-colors ${star <= (hover || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
                                }`}
                        />
                    </button>
                ))}
            </div>
            {submitted && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">✅ ขอบคุณสำหรับคะแนน!</p>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{average || "—"}</span>
                <span>/ 5</span>
                <span className="text-slate-400 dark:text-slate-500">({count} โหวต)</span>
            </div>
        </div>
    );
}
