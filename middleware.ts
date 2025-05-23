// middleware.ts (di root folder)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Path yang memerlukan authentication
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Cek token dari cookie atau header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect ke login jika tidak ada token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect ke dashboard jika sudah login dan akses login page
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
};