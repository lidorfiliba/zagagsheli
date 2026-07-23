import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '~/auth.config';

// Edge-safe: pulls only the base config, no Prisma / bcrypt.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === '/admin/login';
  const isAdminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminArea && !isLoginPage && !isLoggedIn) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/|images/|.*\\.svg$).*)'],
};
