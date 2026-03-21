"use server";

import * as cheerio from "cheerio";

export type ScrapedProduct = {
    name: string;
    image_url: string;
    price_min: number | null;
    price_max: number | null;
    description: string;
    shop_name: string;
    rating: number | null;
    sold: string;
    url: string;
};

const SHOPEE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
    "Referer": "https://shopee.co.th/",
    "X-Requested-With": "XMLHttpRequest",
};

// ============================================================
//  URL Parsing Helpers
// ============================================================

function extractShopeeIds(url: string): { shopId: string; itemId: string } | null {
    const match1 = url.match(/i\.(\d+)\.(\d+)/);
    if (match1) return { shopId: match1[1], itemId: match1[2] };
    const match2 = url.match(/\/product\/(\d+)\/(\d+)/);
    if (match2) return { shopId: match2[1], itemId: match2[2] };
    return null;
}

/**
 * Detect if it's a category/top_products/search page and return the category ID.
 * Example URLs:
 *   https://shopee.co.th/top_products?catId=TH_BITL0_517%3Atop_sold
 *   https://shopee.co.th/หูฟัง-cat.11043625
 *   https://shopee.co.th/search?keyword=headphones
 */
function extractCategoryInfo(url: string): { catId: string | null; keyword: string | null; type: "category" | "search" | "top" | null } {
    // top_products page: catId=TH_BITL0_517:top_sold → extract 517
    const topMatch = url.match(/top_products.*catId=.*?_(\d+)/);
    if (topMatch) return { catId: topMatch[1], keyword: null, type: "top" };

    // Category page: /cat.12345
    const catMatch = url.match(/cat\.(\d+)/);
    if (catMatch) return { catId: catMatch[1], keyword: null, type: "category" };

    // Search page: /search?keyword=xxx
    const searchParams = new URL(url).searchParams;
    const keyword = searchParams.get("keyword");
    if (keyword) return { catId: null, keyword, type: "search" };

    return { catId: null, keyword: null, type: null };
}

// ============================================================
//  Single Product Scraping
// ============================================================

export async function scrapeShopeeProduct(url: string): Promise<{ data?: ScrapedProduct; error?: string }> {
    try {
        if (!url || !url.includes("shopee")) {
            return { error: "กรุณาใส่ลิงก์ Shopee ที่ถูกต้อง" };
        }

        const ids = extractShopeeIds(url);

        // --- Strategy 1: Try Shopee Internal API ---
        if (ids) {
            try {
                const apiUrl = `https://shopee.co.th/api/v4/item/get?shopid=${ids.shopId}&itemid=${ids.itemId}`;
                const apiRes = await fetch(apiUrl, { headers: SHOPEE_HEADERS, cache: "no-store" });

                if (apiRes.ok) {
                    const json = await apiRes.json();
                    const item = json?.data;

                    if (item) {
                        const priceMin = item.price_min ? item.price_min / 100000 : null;
                        const priceMax = item.price_max ? item.price_max / 100000 : null;
                        const imageUrl = item.image ? `https://cf.shopee.co.th/file/${item.image}` : "";

                        return {
                            data: {
                                name: item.name || "",
                                image_url: imageUrl,
                                price_min: priceMin,
                                price_max: priceMax,
                                description: item.description?.substring(0, 500) || "",
                                shop_name: item.shop_name || "",
                                rating: item.item_rating?.rating_star ? parseFloat(item.item_rating.rating_star.toFixed(1)) : null,
                                sold: item.historical_sold ? `${item.historical_sold} sold` : "",
                                url,
                            },
                        };
                    }
                }
            } catch (apiError) {
                console.warn("Shopee API attempt failed, falling back to meta tags:", apiError);
            }
        }

        // --- Strategy 2: Fallback to HTML Meta Tags (OpenGraph) ---
        const res = await fetch(url, {
            headers: {
                ...SHOPEE_HEADERS,
                "Accept": "text/html,application/xhtml+xml",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return { error: `Failed to fetch URL: HTTP ${res.status}` };
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr("content") || $("title").text() || "";
        const ogImage = $('meta[property="og:image"]').attr("content") || "";
        const ogDescription = $('meta[property="og:description"]').attr("content") || "";

        let priceMin: number | null = null;
        const priceMatch = ogDescription.match(/฿([\d,]+)/);
        if (priceMatch) {
            priceMin = parseFloat(priceMatch[1].replace(/,/g, ""));
        }

        const jsonLdScript = $('script[type="application/ld+json"]').html();
        if (jsonLdScript) {
            try {
                const jsonLd = JSON.parse(jsonLdScript);
                if (jsonLd.offers?.price) {
                    priceMin = parseFloat(jsonLd.offers.price);
                }
            } catch { /* ignore */ }
        }

        if (!ogTitle && !ogImage) {
            return {
                error: "ไม่สามารถดึงข้อมูลได้ Shopee อาจบล็อกคำขอ ลองใช้ Import CSV แทนครับ",
            };
        }

        return {
            data: {
                name: ogTitle.replace(/ \| Shopee.*$/i, "").trim(),
                image_url: ogImage,
                price_min: priceMin,
                price_max: null,
                description: ogDescription.substring(0, 500),
                shop_name: "",
                rating: null,
                sold: "",
                url,
            },
        };
    } catch (error: any) {
        console.error("Scraping error:", error);
        return { error: error.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด" };
    }
}

// ============================================================
//  Category / Top Products / Search Scraping (Multiple Items)
// ============================================================

export async function scrapeShopeeCategory(url: string): Promise<{
    data?: ScrapedProduct[];
    error?: string;
}> {
    try {
        if (!url || !url.includes("shopee")) {
            return { error: "กรุณาใส่ลิงก์ Shopee ที่ถูกต้อง" };
        }

        const info = extractCategoryInfo(url);

        // --- Try Shopee Search/Category API ---
        let apiUrl = "";

        if (info.type === "top" && info.catId) {
            // Top sold products by category
            apiUrl = `https://shopee.co.th/api/v4/search/search_items?by=sales&keyword=&limit=20&match_id=${info.catId}&newest=0&order=desc&page_type=search&scenario=PAGE_CATEGORY&version=2`;
        } else if (info.type === "category" && info.catId) {
            // Category listing
            apiUrl = `https://shopee.co.th/api/v4/search/search_items?by=relevancy&keyword=&limit=20&match_id=${info.catId}&newest=0&order=desc&page_type=search&scenario=PAGE_CATEGORY&version=2`;
        } else if (info.type === "search" && info.keyword) {
            // Search results
            apiUrl = `https://shopee.co.th/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(info.keyword)}&limit=20&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
        } else {
            return { error: "ลิงก์นี้ไม่ใช่หน้าหมวดหมู่ หน้าค้นหา หรือหน้าสินค้าขายดี กรุณาลองใช้ลิงก์รูปแบบอื่น" };
        }

        console.log("Fetching Shopee API:", apiUrl);

        const apiRes = await fetch(apiUrl, { headers: SHOPEE_HEADERS, cache: "no-store" });

        if (!apiRes.ok) {
            // Fallback: try a simpler API call
            const fallbackUrl = info.catId
                ? `https://shopee.co.th/api/v4/recommend/recommend?bundle=category_landing_page&limit=20&catid=${info.catId}&offset=0`
                : "";

            if (fallbackUrl) {
                const fallbackRes = await fetch(fallbackUrl, { headers: SHOPEE_HEADERS, cache: "no-store" });
                if (fallbackRes.ok) {
                    const fallbackJson = await fallbackRes.json();
                    const sections = fallbackJson?.data?.sections || [];
                    const items: any[] = [];
                    for (const section of sections) {
                        if (section.data?.item) {
                            items.push(...section.data.item);
                        }
                    }
                    if (items.length > 0) {
                        return { data: items.map(mapShopeeItem) };
                    }
                }
            }

            return { error: `Shopee API returned HTTP ${apiRes.status}. Shopee อาจบล็อกคำขอ` };
        }

        const json = await apiRes.json();
        const items = json?.items || json?.data?.items || [];

        if (!items || items.length === 0) {
            // Try alternate response structure
            const altItems = json?.item_cards?.item_card_data || [];
            if (altItems.length > 0) {
                return { data: altItems.map(mapShopeeItem) };
            }
            return { error: "ไม่พบสินค้าในหน้านี้ Shopee อาจเปลี่ยนรูปแบบ API หรือบล็อกคำขอ" };
        }

        const products: ScrapedProduct[] = items.map((entry: any) => {
            const item = entry.item_basic || entry;
            return mapShopeeItem(item);
        });

        return { data: products };
    } catch (error: any) {
        console.error("Category scraping error:", error);
        return { error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่" };
    }
}

function mapShopeeItem(item: any): ScrapedProduct {
    const priceMin = item.price_min ? item.price_min / 100000 : (item.price ? item.price / 100000 : null);
    const priceMax = item.price_max ? item.price_max / 100000 : null;
    const image = item.image || item.images?.[0] || "";
    const imageUrl = image.startsWith("http") ? image : (image ? `https://cf.shopee.co.th/file/${image}` : "");
    const shopId = item.shopid || item.shop_id || "";
    const itemId = item.itemid || item.item_id || "";

    return {
        name: item.name || item.item_name || "",
        image_url: imageUrl,
        price_min: priceMin,
        price_max: priceMax,
        description: (item.description || "").substring(0, 300),
        shop_name: item.shop_name || "",
        rating: item.item_rating?.rating_star ? parseFloat(item.item_rating.rating_star.toFixed(1)) : null,
        sold: item.historical_sold ? `${item.historical_sold} sold` : (item.sold ? `${item.sold} sold` : ""),
        url: shopId && itemId ? `https://shopee.co.th/product/${shopId}/${itemId}` : "",
    };
}

// ============================================================
//  Auto-detect URL type & scrape accordingly
// ============================================================

export async function scrapeShopeeAuto(url: string): Promise<{
    type: "single" | "multiple";
    single?: ScrapedProduct;
    multiple?: ScrapedProduct[];
    error?: string;
}> {
    // Check if it's a single product URL
    const ids = extractShopeeIds(url);
    if (ids) {
        const res = await scrapeShopeeProduct(url);
        if (res.data) return { type: "single", single: res.data };
        return { type: "single", error: res.error };
    }

    // Otherwise try category/search/top page
    const catInfo = extractCategoryInfo(url);
    if (catInfo.type) {
        const res = await scrapeShopeeCategory(url);
        if (res.data) return { type: "multiple", multiple: res.data };
        return { type: "multiple", error: res.error };
    }

    return { type: "single", error: "ไม่รู้จักรูปแบบ URL นี้ ลองใช้ URL สินค้าเดี่ยว หรือ URL หน้าหมวดหมู่/ค้นหา" };
}
