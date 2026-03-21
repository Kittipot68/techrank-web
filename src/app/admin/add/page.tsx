import { getCategories } from "@/app/actions/admin";
import AddProductForm from "@/components/admin/AddProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddProductPage() {
    const categories = await getCategories();

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
            <div className="flex justify-center">
                <AddProductForm categories={categories} />
            </div>
        </div>
    );
}
