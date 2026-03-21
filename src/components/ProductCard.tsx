import Link from 'next/link'
import { Check, Star, ExternalLink, Users, Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProductCardProps {
    product: any
    rank?: number
    userRating?: { average: number; count: number }
}

export function ProductCard({ product, rank, userRating }: ProductCardProps) {
    const categoryData = product.categories || product.category;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
            {rank && (
                <div className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-br-xl bg-blue-600 dark:bg-blue-500 text-sm font-bold text-white">
                    #{rank}
                </div>
            )}

            {/* Product Image — CLICKABLE */}
            <Link href={`/product/${product.slug}`} className="block aspect-[4/3] relative bg-white border-b border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer group/img">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-5 transition-transform duration-500 group-hover/img:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <div className="text-center">
                            <div className="text-4xl mb-1">📦</div>
                            <span className="text-xs font-medium text-slate-400">รูปภาพเร็วๆ นี้</span>
                        </div>
                    </div>
                )}

                {/* Score Badge */}
                {product.overall_score && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{product.overall_score}</span>
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {categoryData && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 capitalize">
                                {categoryData.name || categoryData.slug?.replace('-', ' ')}
                            </div>
                        )}
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem] leading-tight">
                            <Link href={`/product/${product.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {product.name}
                            </Link>
                        </h3>
                    </div>
                </div>

                {/* User Rating */}
                {userRating && userRating.count > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`h-3 w-3 ${s <= Math.round(userRating.average) ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"}`}
                                />
                            ))}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{userRating.average}</span>
                        <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" />
                            ({userRating.count})
                        </span>
                    </div>
                )}

                {/* Pros */}
                <div className="mt-3 mb-4 space-y-1.5 flex-1">
                    {product.pros?.slice(0, 2).map((pro: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" />
                            <span className="line-clamp-1">{pro}</span>
                        </div>
                    ))}
                </div>

                {/* Price + Actions */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        {product.price_min ? (
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                                ฿{product.price_min.toLocaleString()}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 dark:text-slate-500">ราคาไม่ระบุ</div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {product.affiliate_url && (
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-xs gap-1" asChild>
                                <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                                    ดูราคา <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/product/${product.slug}`}>รายละเอียด</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
