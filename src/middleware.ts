import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization')

    // Set your admin username and password here
    // Format: username:password
    // e.g. admin:techrank2026
    const USER = process.env.ADMIN_USER || 'admin'
    const PASSWORD = process.env.ADMIN_PASSWORD || 'password'

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1]
        const [user, pwd] = atob(authValue).split(':')

        if (user === USER && pwd === PASSWORD) {
            return NextResponse.next()
        }
    }

    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    })
}

export const config = {
    matcher: ['/admin/:path*'],
}
