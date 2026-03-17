import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// 로그인이 필요한 경로
const PROTECTED_PATHS = ['/storage']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isProtected = PROTECTED_PATHS.some((path) => nextUrl.pathname.startsWith(path))

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // API 라우트, 정적 파일, _next 경로 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
