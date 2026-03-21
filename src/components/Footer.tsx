import Link from 'next/link'
import { Bot } from 'lucide-react'
import { FeedbackForm } from './FeedbackForm'
import { getAllCategories } from '@/lib/queries'

export async function Footer() {
    const categories = await getAllCategories();

    return (
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
                            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <span>TechRank</span>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            จัดอันดับอุปกรณ์ไอทีอย่างเป็นกลาง ด้วยข้อมูลจริงและคะแนนที่วัดผลได้
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">หมวดหมู่</h3>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            {categories.slice(0, 6).map((cat) => (
                                <li key={cat.id}>
                                    <Link href={`/category/${cat.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">ลิงก์</h3>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link href="/compare" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">เปรียบเทียบสินค้า</Link></li>
                            <li><Link href="/wishlist" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">สินค้าที่บันทึก</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">💬 ส่ง Feedback</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                            แนะนำ ติชม หรือแจ้งปัญหา เราพร้อมรับฟังครับ
                        </p>
                        <FeedbackForm />
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} TechRank. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
