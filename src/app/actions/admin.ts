"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Categories ---

export async function getCategories() {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data;
}

export async function addCategory(name: string, slug: string) {
    const { data, error } = await supabase
        .from("categories")
        .insert([{ name, slug }])
        .select();

    if (error) {
        console.error("Error adding category:", error);
        return { error: error.message };
    }
    revalidatePath("/admin");
    return { data };
}

// --- Products ---

const productSchema = z.object({
    category_id: z.string().uuid("Please select a category"),
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Slug is required"),
    price_min: z.number().nullable().optional(),
    price_max: z.number().nullable().optional(),
    overall_score: z.number().min(0).max(10).nullable().optional(),
    sound_score: z.number().min(0).max(10).nullable().optional(),
    fps_score: z.number().min(0).max(10).nullable().optional(),
    comfort_score: z.number().min(0).max(10).nullable().optional(),
    build_score: z.number().min(0).max(10).nullable().optional(),
    pros: z.array(z.string()).nullable().optional(),
    cons: z.array(z.string()).nullable().optional(),
    description: z.string().nullable().optional(),
    affiliate_url: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
    image_url: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
});

export async function getProducts() {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return data;
}

export async function addProduct(formData: FormData) {
    try {
        const rawData = {
            category_id: formData.get("category_id"),
            name: formData.get("name"),
            slug: formData.get("slug"),
            price_min: formData.get("price_min") ? Number(formData.get("price_min")) : null,
            price_max: formData.get("price_max") ? Number(formData.get("price_max")) : null,
            overall_score: formData.get("overall_score") ? Number(formData.get("overall_score")) : null,
            sound_score: formData.get("sound_score") ? Number(formData.get("sound_score")) : null,
            fps_score: formData.get("fps_score") ? Number(formData.get("fps_score")) : null,
            comfort_score: formData.get("comfort_score") ? Number(formData.get("comfort_score")) : null,
            build_score: formData.get("build_score") ? Number(formData.get("build_score")) : null,
            pros: formData.getAll("pros").filter(Boolean) as string[],
            cons: formData.getAll("cons").filter(Boolean) as string[],
            description: formData.get("description") || null,
            affiliate_url: formData.get("affiliate_url"),
            image_url: formData.get("image_url"),
        };

        const validatedData = productSchema.parse(rawData);

        const { data, error } = await supabase
            .from("products")
            .insert([validatedData])
            .select();

        if (error) throw error;

        revalidatePath("/admin");
        return { success: true, data };
    } catch (error: any) {
        console.error("Error adding product:", error);
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: error.message || "Failed to add product" };
    }
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from("products")
        .delete()
        .match({ id });

    if (error) {
        console.error("Error deleting product:", error);
        return { error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching product:", error);
        return null;
    }
    return data;
}

export async function updateProduct(id: string, formData: FormData) {
    try {
        const rawData = {
            category_id: formData.get("category_id"),
            name: formData.get("name"),
            slug: formData.get("slug"),
            price_min: formData.get("price_min") ? Number(formData.get("price_min")) : null,
            price_max: formData.get("price_max") ? Number(formData.get("price_max")) : null,
            overall_score: formData.get("overall_score") ? Number(formData.get("overall_score")) : null,
            sound_score: formData.get("sound_score") ? Number(formData.get("sound_score")) : null,
            fps_score: formData.get("fps_score") ? Number(formData.get("fps_score")) : null,
            comfort_score: formData.get("comfort_score") ? Number(formData.get("comfort_score")) : null,
            build_score: formData.get("build_score") ? Number(formData.get("build_score")) : null,
            pros: formData.getAll("pros").filter(Boolean) as string[],
            cons: formData.getAll("cons").filter(Boolean) as string[],
            description: formData.get("description") || null,
            affiliate_url: formData.get("affiliate_url") || '',
            image_url: formData.get("image_url") || '',
        };

        const validatedData = productSchema.parse(rawData);

        const { data, error } = await supabase
            .from("products")
            .update(validatedData)
            .eq("id", id)
            .select();

        if (error) throw error;

        revalidatePath("/admin");
        revalidatePath(`/product/${validatedData.slug}`);
        return { success: true, data };
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: error.message || "Failed to update product" };
    }
}

// --- Specs ---

export async function getProductSpecs(productId: string) {
    const { data, error } = await supabase
        .from("specs")
        .select("*")
        .eq("product_id", productId)
        .order("created_at");

    if (error) {
        console.error("Error fetching specs:", error);
        return [];
    }
    return data || [];
}

export async function saveProductSpecs(productId: string, specs: { key: string; value: string }[]) {
    try {
        // Delete existing specs
        await supabase
            .from("specs")
            .delete()
            .eq("product_id", productId);

        // Insert new specs (if any)
        if (specs.length > 0) {
            const rows = specs
                .filter(s => s.key.trim() && s.value.trim())
                .map(s => ({
                    product_id: productId,
                    key: s.key.trim(),
                    value: s.value.trim(),
                }));

            if (rows.length > 0) {
                const { error } = await supabase.from("specs").insert(rows);
                if (error) throw error;
            }
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Error saving specs:", error);
        return { error: error.message || "Failed to save specs" };
    }
}

// --- Bulk Import ---

export async function bulkImportProducts(products: any[]) {
    try {
        // Prepare data for insertion (validate and clean up)
        const validProducts: { product: any; specs: { key: string; value: string }[]; rawName: string }[] = [];
        for (const raw of products) {
            try {
                // Skip empty rows
                if (!raw.name || !raw.slug || !raw.category_id) continue;

                const cleaned = {
                    category_id: raw.category_id,
                    name: raw.name,
                    slug: raw.slug,
                    description: raw.description || null,
                    price_min: raw.price_min ? Number(raw.price_min) : null,
                    price_max: raw.price_max ? Number(raw.price_max) : null,
                    overall_score: raw.overall_score ? Number(raw.overall_score) : null,
                    sound_score: raw.sound_score ? Number(raw.sound_score) : null,
                    fps_score: raw.fps_score ? Number(raw.fps_score) : null,
                    comfort_score: raw.comfort_score ? Number(raw.comfort_score) : null,
                    build_score: raw.build_score ? Number(raw.build_score) : null,
                    pros: raw.pros ? String(raw.pros).split(';').map((s: string) => s.trim()).filter(Boolean) : [],
                    cons: raw.cons ? String(raw.cons).split(';').map((s: string) => s.trim()).filter(Boolean) : [],
                    affiliate_url: raw.affiliate_url || '',
                    image_url: raw.image_url || '',
                }

                // Extract specs from spec_N_key / spec_N_value columns
                const specs: { key: string; value: string }[] = [];
                for (let i = 1; i <= 10; i++) {
                    const key = raw[`spec_${i}_key`]?.trim();
                    const value = raw[`spec_${i}_value`]?.trim();
                    if (key && value) {
                        specs.push({ key, value });
                    }
                }

                // Use zod to validate each row before pushing
                validProducts.push({
                    product: productSchema.parse(cleaned),
                    specs,
                    rawName: raw.name,
                });
            } catch (e) {
                console.warn("Skipping invalid row during import:", raw.name, e);
            }
        }

        if (validProducts.length === 0) {
            return { error: "No valid products found to import. Check required fields (name, slug, category_id)." };
        }

        let importedCount = 0;
        let specCount = 0;

        // Insert products one by one to get IDs for spec insertion
        for (const { product, specs, rawName } of validProducts) {
            const { data, error } = await supabase
                .from("products")
                .upsert([product], { onConflict: "slug" })
                .select();

            if (error) {
                console.warn(`Failed to import "${rawName}":`, error.message);
                continue;
            }

            importedCount++;

            // Insert specs if we have a product ID
            if (data && data[0] && specs.length > 0) {
                // Delete old specs first
                await supabase.from("specs").delete().eq("product_id", data[0].id);

                const specRows = specs.map(s => ({
                    product_id: data[0].id,
                    key: s.key,
                    value: s.value,
                }));
                const { error: specErr } = await supabase.from("specs").insert(specRows);
                if (!specErr) specCount += specRows.length;
            }
        }

        revalidatePath("/admin");
        return { success: true, count: importedCount, specCount };
    } catch (error: any) {
        console.error("Error bulk importing products:", error);
        return { error: error.message || "Failed to bulk import products" };
    }
}
