import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/data/db';
import { verifyAdminRouteAccess } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner']);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 100;

    const logs = await getAuditLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
