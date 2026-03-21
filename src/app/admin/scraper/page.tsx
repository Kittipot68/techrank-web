import { getCategories } from "@/app/actions/admin";
import ScraperForm from "@/components/admin/ScraperForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ScraperPage() {
    const categories = await getCategories();

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">🛒 Shopee Product Scraper</h1>
                <p className="text-gray-500 mt-2">
                    Paste a Shopee product URL below. The system will try to extract product data automatically.
                    <br />
                    <span className="text-xs text-amber-600">
                        ⚠️ Note: Shopee may block some requests. If scraping fails, try the CSV import instead.
                    </span>
                </p>
            </div>

            <ScraperForm categories={categories} />
        </div>
    );
}
