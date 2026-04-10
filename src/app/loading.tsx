"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
            <p className="text-sm font-medium animate-pulse">กำลังโหลดข้อมูลพรีเมียม...</p>
        </div>
    );
}
