import { Database } from '@/types/database'
import { Check, Minus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProductWithSpecs = Database['public']['Tables']['products']['Row'] & {
    specs: Database['public']['Tables']['specs']['Row'][]
}

interface ComparisonTableProps {
    products: ProductWithSpecs[]
}

export function ComparisonTable({ products }: ComparisonTableProps) {
    if (products.length === 0) return null

    // Extract all unique spec keys from all products
    const allSpecKeys = Array.from(
        new Set(products.flatMap(p => p.specs.map(s => s.key)))
    ).sort()

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-medium text-slate-500 dark:text-slate-400 w-1/4">คุณสมบัติ</th>
                        {products.map(product => (
                            <th key={product.id} className="p-4 font-semibold text-slate-900 dark:text-white w-1/3">
                                {product.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {/* Scores Row */}
                    <tr>
                        <td className="p-4 font-medium text-slate-900 dark:text-white">คะแนนรวม</td>
                        {products.map(product => (
                            <td key={product.id} className="p-4">
                                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-bold text-blue-700 dark:text-blue-400">
                                    {product.overall_score}
                                </span>
                            </td>
                        ))}
                    </tr>

                    {/* Price Row */}
                    <tr>
                        <td className="p-4 font-medium text-slate-900 dark:text-white">ราคา</td>
                        {products.map(product => (
                            <td key={product.id} className="p-4 font-medium text-slate-700 dark:text-slate-300">
                                {product.price_min ? `฿${product.price_min.toLocaleString()}` : "ไม่ระบุ"}
                                {product.price_max ? ` - ฿${product.price_max.toLocaleString()}` : ""}
                            </td>
                        ))}
                    </tr>

                    {/* Dynamic Specs Rows */}
                    {allSpecKeys.map(key => (
                        <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{key}</td>
                            {products.map(product => {
                                const spec = product.specs.find(s => s.key === key)
                                return (
                                    <td key={product.id} className="p-4 text-slate-700 dark:text-slate-300">
                                        {spec ? spec.value : <Minus className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
