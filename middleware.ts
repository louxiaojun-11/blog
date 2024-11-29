import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPublicPath = request.nextUrl.pathname.startsWith('/public/')
  
  // 如果是登录页面且已有token，重定向到首页
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 如果不是登录页面且没有token，重定向到登录页
  if (!isLoginPage && !isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 