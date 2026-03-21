import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { getProductsBySlugs } from "@/lib/queries";

interface ComparisonResultPageProps {
    params: Promise<{
        slugs: string;
    }>;
}

export async function generateMetadata({ params }: ComparisonResultPageProps): Promise<Metadata> {
    const { slugs } = await params;
    const parts = slugs.split("-vs-");

    if (parts.length !== 2) return { title: 'Comparison' };

    const [slug1, slug2] = parts;
    const decodedSlug1 = decodeURIComponent(slug1);
    const decodedSlug2 = decodeURIComponent(slug2);

    const products = await getProductsBySlugs([decodedSlug1, decodedSlug2]);
    const p1 = products.find(p => p.slug === decodedSlug1);
    const p2 = products.find(p => p.slug === decodedSlug2);

    if (!p1 || !p2) return { title: 'Products Not Found' };

    const title = `${p1.name} vs ${p2.name} - เปรียบเทียบ | TechRank`;
    const description = `เปรียบเทียบ ${p1.name} กับ ${p2.name} แบบละเอียด คะแนน สเปค ฟีเจอร์ ตัวไหนดีกว่า คุ้มค่ากว่ากัน?`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://techrank-demo.vercel.app/compare/${slugs}`,
            type: 'website',
            images: p1.image_url || p2.image_url ? [
                ...p1.image_url ? [{ url: p1.image_url, width: 600, height: 600 }] : [],
                ...p2.image_url ? [{ url: p2.image_url, width: 600, height: 600 }] : [],
            ] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function ComparisonResultPage({ params }: ComparisonResultPageProps) {
    const { slugs } = await params;

    // Expected format: slug1-vs-slug2
    const parts = slugs.split("-vs-");
    if (parts.length !== 2) {
        notFound();
    }

    const [slug1, slug2] = parts;
    const decodedSlug1 = decodeURIComponent(slug1);
    const decodedSlug2 = decodeURIComponent(slug2);

    const products = await getProductsBySlugs([decodedSlug1, decodedSlug2]);
    const product1 = products.find(p => p.slug === decodedSlug1);
    const product2 = products.find(p => p.slug === decodedSlug2);

    if (!product1 || !product2) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                    <Link href="/compare">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        กลับไปเลือกสินค้า
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                    {product1.name} vs {product2.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">เปรียบเทียบแบบละเอียด</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <ProductCard product={product1 as any} />
                <ProductCard product={product2 as any} />
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">ตารางเปรียบเทียบ</h2>
                    <ComparisonTable products={[product1 as any, product2 as any]} />
                </div>
            </div>
        </div>
    );
}
