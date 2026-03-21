import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getCategories, getProductSpecs } from "@/app/actions/admin";
import EditProductForm from "@/components/admin/EditProductForm";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    const [product, categories, specs] = await Promise.all([
        getProductById(id),
        getCategories(),
        getProductSpecs(id),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-8">
                <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                    ← กลับไปหน้า Dashboard
                </Link>
                <h1 className="text-3xl font-bold mt-2">แก้ไขสินค้า</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    กำลังแก้ไข: <strong>{product.name}</strong>
                </p>
            </div>

            <EditProductForm product={product} categories={categories} specs={specs} />
        </div>
    );
}
