import { supabase } from "./supabase";

// ============================================================
//  Types
// ============================================================

export type ProductWithCategory = {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    price_min: number | null;
    price_max: number | null;
    overall_score: number | null;
    sound_score: number | null;
    fps_score: number | null;
    comfort_score: number | null;
    build_score: number | null;
    pros: string[] | null;
    cons: string[] | null;
    description: string | null;
    affiliate_url: string | null;
    image_url: string | null;
    images: string[] | null;          // รูปภาพทั้งหมด (หลายรูป จาก Shopee)
    created_at: string;
    categories: {
        id: string;
        name: string;
        slug: string;
        created_at: string;
    } | null;
    specs?: {
        id: string;
        product_id: string;
        key: string;
        value: string;
        created_at: string;
    }[];
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
};

// ============================================================
//  Category Queries
// ============================================================

export async function getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

// ============================================================
//  Product Queries
// ============================================================

export async function getAllProducts(): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .not("overall_score", "is", null) // 🛡️ Quality Filter: Only show enriched items
        .order("overall_score", { ascending: false, nullsFirst: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return (data as any) || [];
}

export async function getTopProducts(limit = 3): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .not("overall_score", "is", null) // 🛡️ Quality Filter: Only show enriched items
        .order("overall_score", { ascending: false, nullsFirst: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching top products:", error);
        return [];
    }
    return (data as any) || [];
}

export async function getProductsByCategory(
    categoryId: string, 
    page = 1, 
    limit = 12,
    sort: string = 'score-desc',
    priceMin?: number,
    priceMax?: number
): Promise<{ products: ProductWithCategory[], total: number }> {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from("products")
        .select("*, categories(*)", { count: 'exact' })
        .eq("category_id", categoryId)
        .not("overall_score", "is", null); // 🛡️ Quality Filter: Only show enriched items

    // Filter by Price
    if (priceMin !== undefined) query = query.gte('price_min', priceMin);
    if (priceMax !== undefined) query = query.lte('price_min', priceMax);

    // Sorting
    switch (sort) {
        case "score-desc": query = query.order("overall_score", { ascending: false, nullsFirst: false }); break;
        case "score-asc": query = query.order("overall_score", { ascending: true, nullsFirst: false }); break;
        case "price-asc": query = query.order("price_min", { ascending: true, nullsFirst: false }); break;
        case "price-desc": query = query.order("price_min", { ascending: false, nullsFirst: false }); break;
        case "name-asc": query = query.order("name", { ascending: true }); break;
        default: query = query.order("overall_score", { ascending: false, nullsFirst: false });
    }

    const { data, error, count } = await query.range(start, end);

    if (error) {
        console.error("Error fetching products by category:", error);
        return { products: [], total: 0 };
    }
    return { products: (data as any) || [], total: count || 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("slug", slug)
        .single();

    if (error) return null;

    if (data) {
        const { data: specs } = await supabase
            .from("specs")
            .select("*")
            .eq("product_id", data.id);

        return { ...(data as any), specs: specs || [] };
    }

    return null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .in("slug", slugs);

    if (error) {
        console.error("Error fetching products by slugs:", error);
        return [];
    }

    const productIds = (data || []).map((p: any) => p.id);
    const { data: allSpecs } = await supabase
        .from("specs")
        .select("*")
        .in("product_id", productIds);

    return (data || []).map((product: any) => ({
        ...product,
        specs: (allSpecs || []).filter((s: any) => s.product_id === product.id),
    }));
}
