import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSessionFromRequest,
  clearAdminSessionCookie,
} from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/data/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Sign out from Supabase if active
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}

    // Audit log entry
    if (session) {
      try {
        await createAuditLog({
          user_id: session.userId.includes('-default-') ? null : session.userId,
          action: 'ADMIN_LOGOUT',
          entity_type: 'auth',
          entity_id: session.email,
          details: { ip: clientIp, timestamp: new Date().toISOString() },
          ip_address: clientIp,
        });
      } catch {}
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    clearAdminSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    const response = NextResponse.json(
      { success: false, error: 'Error during logout' },
      { status: 500 }
    );
    clearAdminSessionCookie(response);
    return response;
  }
}
