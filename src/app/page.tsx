import Link from "next/link";
import { ArrowRight, Trophy, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedSlider } from "@/components/FeaturedSlider";
import { getTopProducts, getAllCategories, getAllProducts } from "@/lib/queries";
import { getProductRating } from "@/app/actions/engagement";

export default async function Home() {
  const [topProducts, categories, allProducts] = await Promise.all([
    getTopProducts(5),
    getAllCategories(),
    getAllProducts(),
  ]);

  // Fetch user ratings for top products
  const ratingsMap: Record<string, { average: number; count: number }> = {};
  await Promise.all(topProducts.map(async (p) => {
    ratingsMap[p.id] = await getProductRating(p.id);
  }));

  // Group products by category for display
  const productsByCategory = categories
    .map(cat => ({
      ...cat,
      products: allProducts.filter(p => p.category_id === cat.id).slice(0, 4),
    }))
    .filter(cat => cat.products.length > 0);

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 md:py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            ค้นหา<span className="text-blue-400">อุปกรณ์ไอที</span>ที่ดีที่สุด
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            จัดอันดับอย่างเป็นกลาง รีวิวจากการใช้งานจริง ข้อมูลวิเคราะห์โดย AI ช่วยให้คุณตัดสินใจซื้อได้อย่างมั่นใจ
          </p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
              <Link href="/category/headphones">ดูหมวดหูฟัง</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-slate-600 text-white hover:bg-slate-800 hover:text-white dark:border-slate-500 dark:hover:bg-slate-700">
              <Link href="/compare">เปรียบเทียบสินค้า</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Slider */}
      {topProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🔥 สินค้าแนะนำ</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">เลื่อนเพื่อดูเพิ่มเติม</span>
          </div>
          <FeaturedSlider products={topProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image_url: p.image_url,
            overall_score: p.overall_score,
            price_min: p.price_min,
            categories: p.categories ? { name: p.categories.name, slug: p.categories.slug } : null,
          }))} />
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 md:mb-8 text-slate-900 dark:text-white">หมวดหมู่แนะนำ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/category/headphones" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:p-8 text-white transition-transform hover:scale-[1.01]">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold">หูฟัง (Headphones)</h3>
              <p className="mt-2 text-indigo-100 text-sm md:text-base">แบบครอบหู, อินเอียร์ และตัดเสียงรบกวน</p>
              <div className="mt-3 md:mt-4 inline-flex items-center text-sm font-semibold">
                ดูอันดับ <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <Trophy className="absolute right-4 bottom-4 h-24 w-24 md:h-32 md:w-32 text-white/10 rotate-12" />
          </Link>
          <Link href="/category/gaming-gear" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 md:p-8 text-white transition-transform hover:scale-[1.01]">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold">อุปกรณ์เกมมิ่ง</h3>
              <p className="mt-2 text-blue-100 text-sm md:text-base">เมาส์, คีย์บอร์ด และจอเกมมิ่ง</p>
              <div className="mt-3 md:mt-4 inline-flex items-center text-sm font-semibold">
                ดูอันดับ <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <Zap className="absolute right-4 bottom-4 h-24 w-24 md:h-32 md:w-32 text-white/10 rotate-12" />
          </Link>
        </div>
      </section>

      {/* Products by Category */}
      {productsByCategory.map((cat) => (
        <section key={cat.id} className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold capitalize text-slate-900 dark:text-white">{cat.name}</h2>
            <Link href={`/category/${cat.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium shrink-0">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cat.products.map((product: any, index: number) => (
              <ProductCard key={product.id} product={product} rank={index + 1} userRating={ratingsMap[product.id]} />
            ))}
          </div>
        </section>
      ))}

      {allProducts.length === 0 && (
        <section className="container mx-auto px-4">
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            ยังไม่มีสินค้า กรุณาเพิ่มสินค้าผ่านหน้า Admin ก่อนครับ
          </div>
        </section>
      )}

      {/* AI Methodology Disclosure */}
      <section className="container mx-auto px-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white text-base">เกี่ยวกับวิธีการวิเคราะห์ของเรา</h3>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 ml-11">
            <p>
              🤖 <strong>คะแนน, ข้อดี และข้อเสีย</strong> ของสินค้าบนเว็บไซต์นี้ วิเคราะห์โดย AI จากข้อมูลสเปคจริง
              และรีวิวจากผู้ใช้งานจริง เราพยายามให้ข้อมูลที่เป็นกลางและแม่นยำที่สุด
            </p>
            <p>
              📊 <strong>สเปคสินค้า</strong> รวบรวมจากเว็บไซต์ทางการของแบรนด์และแหล่งข้อมูลที่น่าเชื่อถือ
              หากพบข้อมูลที่ไม่ถูกต้อง สามารถแจ้งให้เราทราบได้
            </p>
            <p>
              💰 เว็บไซต์นี้มีลิงก์ Affiliate เมื่อคุณซื้อผ่านลิงก์ของเรา เราอาจได้รับค่าคอมมิชชั่น
              แต่จะไม่มีผลต่อการให้คะแนนหรือการรีวิวสินค้า
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
