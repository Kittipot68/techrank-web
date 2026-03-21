'use client'

import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const OPTIONS = [
    { value: 'light' as const, label: 'สว่าง', icon: Sun },
    { value: 'dark' as const, label: 'มืด', icon: Moon },
    { value: 'system' as const, label: 'ตามอุปกรณ์', icon: Monitor },
]

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="เปลี่ยนธีม"
                title="เปลี่ยนธีม"
            >
                <CurrentIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => { setTheme(value); setOpen(false) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === value
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            {theme === value && (
                                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
