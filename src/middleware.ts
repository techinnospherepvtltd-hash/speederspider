import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  refreshSessionToken,
  ADMIN_SESSION_COOKIE,
  setAdminSessionCookie,
} from '@/lib/auth/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Handle Admin Portal Pages
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    // Login page handling
    if (pathname === '/admin/login') {
      if (session) {
        // Already authenticated -> redirect to admin dashboard
        const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/admin';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      return NextResponse.next();
    }

    // Protected admin pages: require valid session
    if (!session) {
      const loginUrl = new URL('/admin/login', req.url);
      const destination = pathname + req.nextUrl.search;
      loginUrl.searchParams.set('redirect', destination);

      const response = NextResponse.redirect(loginUrl);
      // Clean up stale or invalid session cookie
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      response.cookies.delete('speederspider_auth_active');
      return response;
    }

    // Owner-only route authorization
    if (pathname.startsWith('/admin/audit-logs') && session.role !== 'owner') {
      const dashboardUrl = new URL('/admin', req.url);
      dashboardUrl.searchParams.set('error', 'unauthorized_owner_required');
      return NextResponse.redirect(dashboardUrl);
    }

    // Authenticated: slide idle timeout on active session
    const response = NextResponse.next();
    try {
      const refreshedToken = await refreshSessionToken(session);
      setAdminSessionCookie(response, refreshedToken);
    } catch {
      // If refresh fails, maintain existing session
    }

    return response;
  }

  // 2. Handle Admin API Protection
  if (pathname.startsWith('/api/audit-logs')) {
    const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!session || session.role !== 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Security Audit Logs require verified OWNER credentials.',
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin portal pages and protected security APIs:
     * - /admin
     * - /admin/:path*
     * - /api/audit-logs/:path*
     */
    '/admin/:path*',
    '/api/audit-logs/:path*',
  ],
};
