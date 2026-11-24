import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSessionFromRequest,
  refreshSessionToken,
  setAdminSessionCookie,
} from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const response = NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        fullName: session.fullName,
        expiresAt: new Date(session.exp * 1000).toISOString(),
        idleExpiresAt: new Date(session.idleExp * 1000).toISOString(),
      },
    });

    // Slide the session idle expiration window
    try {
      const refreshed = await refreshSessionToken(session);
      setAdminSessionCookie(response, refreshed);
    } catch {}

    return response;
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}
