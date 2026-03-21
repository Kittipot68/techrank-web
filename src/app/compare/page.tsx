import { getAllProducts, getAllCategories } from "@/lib/queries";
import { CompareSelector } from "@/components/CompareSelector";

export default async function ComparePage() {
    const [allProducts, categories] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
    ]);

    // Pass minimal data to client component
    const products = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_id: p.category_id
    }));

    const cats = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
    }));

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-14">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    เปรียบเทียบสินค้า
                </h1>
                <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    เลือกหมวดหมู่ แล้วเลือกสินค้า 2 ชิ้นเพื่อดูการเปรียบเทียบคะแนน สเปค และฟีเจอร์แบบเทียบกัน
                </p>
            </div>

            <CompareSelector products={products} categories={cats} />
        </div>
    );
}
