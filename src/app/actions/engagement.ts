"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- User Rating ---

export async function rateProduct(productId: string, rating: number, fingerprint: string) {
    if (rating < 1 || rating > 5) return { error: "Rating must be 1-5" };

    const { error } = await supabase
        .from("product_ratings")
        .upsert(
            { product_id: productId, rating, fingerprint },
            { onConflict: "product_id,fingerprint" }
        );

    if (error) {
        console.error("Error rating product:", error);
        return { error: error.message };
    }
    return { success: true };
}

export async function getProductRating(productId: string) {
    const { data, error } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("product_id", productId);

    if (error || !data || data.length === 0) {
        return { average: 0, count: 0 };
    }

    const total = data.reduce((sum, r) => sum + r.rating, 0);
    return { average: Math.round((total / data.length) * 10) / 10, count: data.length };
}

// --- View Count ---

export async function incrementViewCount(productId: string) {
    const { error } = await supabase.rpc("increment_view_count", { p_id: productId });

    // Fallback if RPC doesn't exist: manual increment
    if (error) {
        const { data: product } = await supabase
            .from("products")
            .select("view_count")
            .eq("id", productId)
            .single();

        await supabase
            .from("products")
            .update({ view_count: (product?.view_count || 0) + 1 })
            .eq("id", productId);
    }
}

export async function getViewCount(productId: string) {
    const { data } = await supabase
        .from("products")
        .select("view_count")
        .eq("id", productId)
        .single();

    return data?.view_count || 0;
}

// --- Newsletter ---

export async function subscribeNewsletter(email: string) {
    if (!email || !email.includes("@")) return { error: "กรุณาใส่อีเมลที่ถูกต้อง" };

    const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email }, { onConflict: "email" });

    if (error) {
        console.error("Newsletter subscribe error:", error);
        return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
    }

    return { success: true };
}
