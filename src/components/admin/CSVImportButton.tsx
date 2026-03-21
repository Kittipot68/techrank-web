"use client";

import { useState, useTransition } from "react";
import { bulkImportProducts } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

export default function CSVImportButton() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                startTransition(async () => {
                    const res = await bulkImportProducts(results.data);
                    if (res.error) {
                        setError(res.error);
                    } else {
                        alert(`Import สำเร็จ! ${res.count} สินค้า, ${res.specCount || 0} specs`);
                        router.refresh(); // Refresh the page to show new products
                    }
                    // Reset file input
                    e.target.value = '';
                });
            },
            error: (error) => {
                setError(error.message);
            }
        });
    };

    return (
        <div className="flex flex-col items-end">
            <div className="relative">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isPending}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    title="Upload CSV"
                />
                <Button variant="outline" disabled={isPending} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    {isPending ? "Importing..." : "Import CSV"}
                </Button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 max-w-xs text-right break-words">{error}</p>}
        </div>
    );
}
