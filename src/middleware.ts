import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isLoginRoute = req.nextUrl.pathname === '/admin/login'
    
    // Ignore non-admin routes
    if (!isAdminRoute) {
        return NextResponse.next()
    }

    const hasSession = req.cookies.has('admin_session')

    // If trying to access /admin/login while logged in, redirect to /admin
    if (isLoginRoute && hasSession) {
        return NextResponse.redirect(new URL('/admin', req.url))
    }

    // If trying to access protected /admin routes without session, redirect to login
    if (!isLoginRoute && !hasSession) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
