"use client";

import { Share2, Facebook, Copy, Check, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareButtonsProps {
    url: string;
    title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only compute full URL after mount to avoid hydration mismatch
    const fullUrl = mounted ? `${window.location.origin}${url}` : url;
    const encodedUrl = encodeURIComponent(fullUrl);

    function copyLink() {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Don't render share links until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> แชร์สินค้านี้
                </h3>
                <div className="flex gap-2">
                    <span className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium">LINE</span>
                    <span className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">Facebook</span>
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">คัดลอกลิงก์</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                <Share2 className="h-4 w-4" /> แชร์สินค้านี้
            </h3>
            <div className="flex gap-2">
                {/* LINE */}
                <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                >
                    <MessageCircle className="h-3.5 w-3.5" />
                    LINE
                </a>

                {/* Facebook */}
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                    <Facebook className="h-3.5 w-3.5" />
                    Facebook
                </a>

                {/* Copy Link */}
                <button
                    onClick={copyLink}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${copied
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        }`}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                </button>
            </div>
        </div>
    );
}
