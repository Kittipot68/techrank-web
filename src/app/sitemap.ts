import { MetadataRoute } from 'next'
import { getAllProducts, getAllCategories } from '@/lib/queries'

const BASE_URL = 'https://techrank-demo.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, categories] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
    ]);

    const routes = [
        '',
        '/compare',
        '/wishlist',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    const categoryRoutes = categories.map((category) => ({
        url: `${BASE_URL}/category/${category.slug}`,
        lastModified: new Date(category.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const productRoutes = products.map((product) => ({
        url: `${BASE_URL}/product/${product.slug}`,
        lastModified: new Date(product.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...routes, ...categoryRoutes, ...productRoutes]
}
