import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Check, Minus, ShoppingCart, Bot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProductBySlug } from "@/lib/queries";
import { getViewCount } from "@/app/actions/engagement";
import { StarRating } from "@/components/StarRating";
import { ShareButtons } from "@/components/ShareButtons";
import { WishlistButton } from "@/components/WishlistButton";
import { ViewCounter } from "@/components/ViewCounter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductImageGallery } from "@/components/ProductImageGallery";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProductBySlug(decodedSlug);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    const title = `${product.name} รีวิว & สเปค | TechRank`;
    const description = `รีวิวเจาะลึก ${product.name} ได้คะแนนเฉลี่ย ${product.overall_score}/10 ดูข้อดี ข้อเสีย เปรียบเทียบสเปคและราคาล่าสุด`;
    const ogImage = product.image_url || "https://techrank-demo.vercel.app/og-default.jpg";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://techrank-demo.vercel.app/product/${slug}`,
            images: [
                {
                    url: ogImage,
                    width: 800,
                    height: 800,
                    alt: product.name,
                }
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        }
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProductBySlug(decodedSlug);

    if (!product) {
        notFound();
    }

    const viewCount = await getViewCount(product.id);

    const allImages = Array.from(new Set([
        ...(product.image_url ? [product.image_url] : []),
        ...(product.images || []),
    ])).filter(Boolean);

    // JSON-LD structured data for Google Rich Snippets
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: allImages.length > 0 ? allImages : ["https://techrank-demo.vercel.app/og-default.jpg"],
        description: `รีวิวเจาะลึก ${product.name}`,
        category: product.categories?.name,
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'THB',
            lowPrice: product.price_min || 0,
            highPrice: product.price_max || product.price_min || 0,
            offerCount: 1,
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: product.overall_score ? {
            '@type': 'AggregateRating',
            ratingValue: product.overall_score,
            bestRating: 10,
            worstRating: 1,
            ratingCount: viewCount > 5 ? viewCount : 5,
        } : undefined,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Breadcrumb ... */}
            <Breadcrumbs 
                items={[
                    { label: product.categories?.name || "Category", href: `/category/${product.categories?.slug}` },
                    { label: product.name }
                ]} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: Image Gallery & Affiliate */}
                <div className="lg:col-span-4 space-y-4">
                    <ProductImageGallery
                        mainImage={product.image_url}
                        images={product.images}
                        productName={product.name}
                    />

                    {/* Buy Box */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">ราคา</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {product.price_min ? `฿${product.price_min.toLocaleString()}` : "ไม่ระบุ"}
                            </span>
                        </div>
                        {product.price_max && product.price_max > (product.price_min || 0) && (
                            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                                ราคาสูงสุด: ฿{product.price_max.toLocaleString()}
                            </div>
                        )}
                        <Button className="w-full gap-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white text-base border-0" size="lg" asChild>
                            <a href={product.affiliate_url || '#'} target="_blank" rel="noopener noreferrer">
                                <ShoppingCart className="h-5 w-5" />
                                ดูราคา / ซื้อเลย
                            </a>
                        </Button>
                        <div className="flex justify-between items-center">
                            <WishlistButton productId={product.id} productName={product.name} />
                            <ViewCounter productId={product.id} initialCount={viewCount} />
                        </div>
                        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                            เมื่อคุณซื้อผ่านลิงก์ของเรา เราอาจได้รับค่าคอมมิชชั่น
                        </p>
                    </div>

                    {/* Star Rating */}
                    <StarRating productId={product.id} />

                    {/* Share */}
                    <ShareButtons url={`/product/${product.slug}`} title={product.name} />
                </div>

                {/* Right Column: Details & Specs */}
                <div className="lg:col-span-8 space-y-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">{product.name}</h1>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                ⭐ คะแนน: {product.overall_score || "N/A"}
                            </Badge>
                            {product.categories?.name && (
                                <Badge variant="outline" className="text-sm px-3 py-1 capitalize border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                    {product.categories.name}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Description / Review */}
                    {product.description && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">📝 รีวิว / คำอธิบาย</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {/* Score Breakdown */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">คะแนนรายหมวด</h2>
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium w-fit">
                                <Bot className="h-3.5 w-3.5" />
                                วิเคราะห์โดย AI
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'เสียง', value: product.sound_score, icon: '🎵' },
                                { label: 'FPS Gaming', value: product.fps_score, icon: '🎮' },
                                { label: 'ความสบาย', value: product.comfort_score, icon: '💆' },
                                { label: 'วัสดุ/คุณภาพ', value: product.build_score, icon: '🔧' },
                            ].map((score) => (
                                score.value ? (
                                    <div key={score.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center hover:shadow-sm transition-shadow">
                                        <div className="text-lg mb-1">{score.icon}</div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score.value}</div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{score.label}</div>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>

                    {/* Pros & Cons - Side by Side Table */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">ข้อดี vs ข้อเสีย</h2>
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium w-fit">
                                <Bot className="h-3.5 w-3.5" />
                                AI วิเคราะห์จากข้อมูลและสเปค
                            </div>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-5 py-3 text-left text-sm font-semibold text-green-700 dark:text-green-500 w-1/2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                ข้อดี
                                            </div>
                                        </th>
                                        <th className="px-5 py-3 text-left text-sm font-semibold text-red-700 dark:text-red-500 w-1/2 border-l border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                    <Minus className="h-3 w-3" />
                                                </div>
                                                ข้อเสีย
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: Math.max(product.pros?.length || 0, product.cons?.length || 0, 1) }).map((_, i) => (
                                        <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-700/30"}>
                                            <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300 align-top">
                                                {product.pros?.[i] ? (
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                        {product.pros[i]}
                                                    </div>
                                                ) : i === 0 && (!product.pros || product.pros.length === 0) ? (
                                                    <span className="text-slate-400 dark:text-slate-500">ยังไม่มีข้อมูล</span>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300 align-top border-l border-slate-200 dark:border-slate-700">
                                                {product.cons?.[i] ? (
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                        {product.cons[i]}
                                                    </div>
                                                ) : i === 0 && (!product.cons || product.cons.length === 0) ? (
                                                    <span className="text-slate-400 dark:text-slate-500">ยังไม่มีข้อมูล</span>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Specifications */}
                    {product.specs && product.specs.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">สเปคสินค้า</h2>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        {product.specs.map((spec, i) => (
                                            <tr key={spec.key} className={i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-700/30"}>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-400 w-1/3">
                                                    {spec.key}
                                                </td>
                                                <td className="px-6 py-3.5 text-sm text-slate-900 dark:text-slate-200">
                                                    {spec.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:bg-slate-800 dark:from-slate-800 dark:to-slate-800 dark:border dark:border-slate-700 rounded-xl p-6 text-white text-center">
                        <h3 className="text-lg font-bold mb-2">สนใจสินค้านี้?</h3>
                        <p className="text-blue-100 dark:text-slate-300 text-sm mb-4">ตรวจสอบราคาล่าสุดและโปรโมชั่นพิเศษ</p>
                        <Button className="bg-white text-blue-700 hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 gap-2 border-0" size="lg" asChild>
                            <a href={product.affiliate_url || '#'} target="_blank" rel="noopener noreferrer">
                                <ShoppingCart className="h-5 w-5" />
                                ดูราคาล่าสุด
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
