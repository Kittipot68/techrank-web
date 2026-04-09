"use server";

import { supabase } from "@/lib/supabase";

export async function uploadImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { error: "No file provided" };
        }

        // Generate a unique filename using timestamp and original name to avoid conflicts
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Convert the File object to ArrayBuffer for uploading via supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase.storage
            .from("images")
            .upload(`products/${fileName}`, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            return { error: error.message };
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(`products/${fileName}`);

        return { url: publicUrl };

    } catch (error: any) {
        console.error("Upload error:", error);
        return { error: error.message || "Failed to upload image" };
    }
}
