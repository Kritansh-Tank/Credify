import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/owner': ['owner'],
  '/stores': ['user'],
  '/change-password': ['admin', 'user', 'owner'],
};

function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value
    ?? request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = decodeJwtRole(token);
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(role)) {
        const dashboardMap: Record<string, string> = {
          admin: '/admin/dashboard',
          user: '/stores',
          owner: '/owner/dashboard',
        };
        return NextResponse.redirect(new URL(dashboardMap[role] ?? '/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*', '/stores', '/change-password'],
};
