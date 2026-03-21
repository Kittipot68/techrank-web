import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/queries";
import { CategoryFilter } from "@/components/CategoryFilter";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        return { title: 'Category Not Found' };
    }

    const title = `จัดอันดับ ${category.name} ที่ดีที่สุด (อัปเดต 2026) | TechRank`;
    const description = `เปรียบเทียบและจัดอันดับ ${category.name} ยอดนิยม ดูรีวิวเจาะลึก สเปค ราคา และจุดเด่นจุดด้อย เพื่อประกอบการตัดสินใจ`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://techrank-demo.vercel.app/category/${slug}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const products = await getProductsByCategory(category.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl capitalize">
                    Best {category.name}
                </h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                    จัดอันดับและรีวิว {category.name.toLowerCase()} จากการทดสอบจริง
                </p>
            </div>

            {products.length > 0 ? (
                <CategoryFilter products={products} />
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    ยังไม่มีสินค้าในหมวดหมู่นี้
                </div>
            )}
        </div>
    );
}
