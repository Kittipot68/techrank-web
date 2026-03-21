import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const ids = request.nextUrl.searchParams.get("ids");
    if (!ids) {
        return NextResponse.json([]);
    }

    const idList = ids.split(",").filter(Boolean);
    if (idList.length === 0) {
        return NextResponse.json([]);
    }

    const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, image_url, price_min, overall_score, affiliate_url, categories(name)")
        .in("id", idList);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}
