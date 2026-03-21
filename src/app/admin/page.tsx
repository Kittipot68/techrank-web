import Link from "next/link";
import { getProducts, getCategories } from "../actions/admin";
import { Button } from "@/components/ui/Button";
import CSVImportButton from "@/components/admin/CSVImportButton";
import DownloadTemplateButton from "@/components/admin/DownloadTemplateButton";
import CategoryManager from "@/components/admin/CategoryManager";
import AdminProductTable from "@/components/admin/AdminProductTable";

export default async function AdminDashboard() {
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories(),
    ]);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex justify-between items-start mb-8 flex-col sm:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2 text-sm flex items-center gap-1">
                        นำเข้าสินค้าจำนวนมากด้วยไฟล์ CSV: <DownloadTemplateButton />
                    </p>
                </div>

                <div className="flex gap-3 items-start flex-wrap">
                    <Button asChild variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
                        <Link href="/admin/scraper">🛒 Shopee Scraper</Link>
                    </Button>
                    <CSVImportButton />
                    <Button asChild>
                        <Link href="/admin/add">+ Add Product</Link>
                    </Button>
                </div>
            </div>

            {/* Product Table with Search, Filter, Pagination */}
            <AdminProductTable products={products} categories={categories} />

            {/* Category Management */}
            <div className="mt-10">
                <CategoryManager categories={categories} />
            </div>
        </div>
    );
}
