"use server";

import { supabase } from "@/lib/supabase";

export async function searchProducts(query: string) {
    if (!query || query.trim().length < 2) return [];

    const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price_min, image_url, overall_score")
        .ilike("name", `%${query.trim()}%`)
        .limit(8);

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    return data || [];
}
