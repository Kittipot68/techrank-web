import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"

        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:bg-blue-300 shadow-sm hover:shadow-md",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
            outline: "border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
            ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
            link: "underline-offset-4 hover:underline text-blue-600 dark:text-blue-400",
        }

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-10 py-2 px-4 text-sm",
            lg: "h-11 px-8 text-base",
            icon: "h-10 w-10",
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
