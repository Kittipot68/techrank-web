import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryBySlug, getProductsByCategory, getAllCategories } from "@/lib/queries";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";

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

export default async function CategoryPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string; sort?: string; min?: string; max?: string }>
}) {
    const [{ slug }, query] = await Promise.all([params, searchParams]);
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const page = Number(query.page) || 1;
    const sort = query.sort || 'score-desc';
    const min = query.min ? Number(query.min) : undefined;
    const max = query.max ? Number(query.max) : undefined;

    const { products, total } = await getProductsByCategory(category.id, page, 12, sort, min, max);
    const allCategories = await getAllCategories();

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs 
                items={[{ label: category.name }]} 
            />
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar: Category Navigation */}
                <aside className="lg:w-64 shrink-0 space-y-8">
                    <div className="hidden lg:block">
                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">สำรวจหมวดหมู่</h2>
                        <nav className="space-y-1">
                            {allCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug}`}
                                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                        cat.id === category.id 
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold" 
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                        <h3 className="text-sm font-bold mb-2">เปรียบเทียบเลย!</h3>
                        <p className="text-[11px] text-blue-100 mb-4 opacity-90">เลือกสินค้าที่คุณสนใจเพื่อดูความแตกต่างในพริบตา</p>
                        <Link href="/compare" className="block text-center py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-colors">
                            ไปที่หน้าเปรียบเทียบ
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl capitalize">
                            {category.name}
                        </h1>
                        <p className="mt-4 text-slate-500 dark:text-slate-400">
                            จัดอันดับและรีวิว {category.name.toLowerCase()} ที่ดีที่สุดจากการทดสอบจริง (ทั้งหมด {total} รายการ)
                        </p>
                    </div>

                    {total > 0 ? (
                        <CategoryFilter 
                            products={products} 
                            totalItems={total} 
                            currentPage={page} 
                        />
                    ) : (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            ยังไม่มีสินค้าในหมวดหมู่นี้
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
