export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                }
                Relationships: []
            }
            products: {
                Row: {
                    id: string
                    category_id: string
                    name: string
                    slug: string
                    price_min: number | null
                    price_max: number | null
                    overall_score: number | null
                    sound_score: number | null
                    fps_score: number | null
                    comfort_score: number | null
                    build_score: number | null
                    pros: string[] | null
                    cons: string[] | null
                    description: string | null
                    affiliate_url: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    category_id: string
                    name: string
                    slug: string
                    price_min?: number | null
                    price_max?: number | null
                    overall_score?: number | null
                    sound_score?: number | null
                    fps_score?: number | null
                    comfort_score?: number | null
                    build_score?: number | null
                    pros?: string[] | null
                    cons?: string[] | null
                    description?: string | null
                    affiliate_url?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string
                    name?: string
                    slug?: string
                    price_min?: number | null
                    price_max?: number | null
                    overall_score?: number | null
                    sound_score?: number | null
                    fps_score?: number | null
                    comfort_score?: number | null
                    build_score?: number | null
                    pros?: string[] | null
                    cons?: string[] | null
                    description?: string | null
                    affiliate_url?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            specs: {
                Row: {
                    id: string
                    product_id: string
                    key: string
                    value: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    key: string
                    value: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    key?: string
                    value?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "specs_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
