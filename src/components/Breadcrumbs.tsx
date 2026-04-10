"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    // Construct JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": item.href ? `https://techrank-demo.vercel.app${item.href}` : undefined
        }))
    };

    return (
        <nav className="flex mb-6 overflow-x-auto no-scrollbar py-1" aria-label="Breadcrumb">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <li>
                    <Link 
                        href="/" 
                        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                
                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors capitalize"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-slate-900 dark:text-white font-medium capitalize">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
