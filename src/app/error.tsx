"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                เกิดข้อผิดพลาดบางอย่าง
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                ขออภัยค่ะ ระบบไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือกลับไปยังหน้าแรก
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <RefreshCcw className="h-4 w-4" /> ลองใหม่อีกครั้ง
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    กลับหน้าหลัก
                </Button>
            </div>
        </div>
    );
}
