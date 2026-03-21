'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: () => { },
})

export function useTheme() {
    return useContext(ThemeContext)
}

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light')
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    // Load saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem('techrank-theme') as Theme | null
        const initial = saved || 'light'
        setThemeState(initial)
        setMounted(true)
    }, [])

    // Apply theme whenever it changes
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        const resolved = theme === 'system' ? getSystemTheme() : theme

        root.classList.remove('light', 'dark')
        root.classList.add(resolved)
        setResolvedTheme(resolved)

        // Update meta theme-color for mobile browsers
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) {
            meta.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff')
        }
    }, [theme, mounted])

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (!mounted || theme !== 'system') return

        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => {
            const resolved = e.matches ? 'dark' : 'light'
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(resolved)
            setResolvedTheme(resolved)
        }

        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [theme, mounted])

    function setTheme(t: Theme) {
        setThemeState(t)
        localStorage.setItem('techrank-theme', t)
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
