import { NextRequest, NextResponse } from 'next/server';
import { executeStockChange, createAuditLog } from '@/lib/data/db';
import { verifyAdminRouteAccess } from '@/lib/auth/session';
import { z } from 'zod';

const transactionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  type: z.enum(['stock_in', 'stock_out', 'adjustment']),
  quantity: z.number().int(),
  reason: z.string().min(3, 'A mandatory reason is required for audit compliance'),
  performedBy: z.string().optional().default('Workshop Supervisor'),
});

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager', 'staff']);
    if (!authCheck.authorized) return authCheck.response;

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }

    const { itemId, type, quantity, reason, performedBy } = parsed.data;
    const result = await executeStockChange(itemId, type, quantity, reason, performedBy);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Transaction failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: result.item });
  } catch (error) {
    console.error('Failed to execute stock transaction:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
