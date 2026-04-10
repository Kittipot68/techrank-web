import Link from "next/link";
import { ArrowRight, Trophy, Zap, Bot, Layers, Sparkles, Smartphone, Headphones, Speaker, Cpu } from "lucide-react";
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

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">สำรวจหมวดหมู่</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">เลือกหมวดหมู่ที่สนใจเพื่อดูการจัดอันดับที่ดีที่สุด</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => {
            // Premium gradients and icons for specific categories or based on index
            const variants = [
              { bg: "from-indigo-600 to-purple-600", icon: <Headphones className="h-12 w-12" /> },
              { bg: "from-blue-600 to-cyan-500", icon: <Cpu className="h-12 w-12" /> },
              { bg: "from-emerald-500 to-teal-600", icon: <Speaker className="h-12 w-12" /> },
              { bg: "from-orange-500 to-amber-600", icon: <Smartphone className="h-12 w-12" /> },
              { bg: "from-rose-500 to-pink-600", icon: <Layers className="h-12 w-12" /> },
              { bg: "from-slate-700 to-slate-900", icon: <Sparkles className="h-12 w-12" /> },
            ];
            
            const variant = variants[idx % variants.length];
            const isHeadphones = cat.slug === "headphones";
            const isGaming = cat.slug === "gaming-gear";
            
            // Override icons if specific slug matches
            let icon = variant.icon;
            if (isHeadphones) icon = <Headphones className="h-12 w-12" />;
            if (isGaming) icon = <Zap className="h-12 w-12" />;

            return (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`} 
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${variant.bg} p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-lg font-bold group-hover:underline decoration-white/30 underline-offset-4">{cat.name}</h3>
                    <p className="mt-1 text-white/80 text-xs line-clamp-1">อันดับสินค้า {cat.name} ล่าสุด</p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    ดูอันดับ <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-500">
                  {icon}
                </div>
              </Link>
            );
          })}
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
