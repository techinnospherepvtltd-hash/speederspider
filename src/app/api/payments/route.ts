import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getPayments,
  getPaymentSummary,
  createPayment,
  updatePayment,
  deletePayment,
  createAuditLog,
} from '@/lib/data/db';
import { verifyAdminRouteAccess } from '@/lib/auth/session';
import {
  PaymentTransactionType,
  PaymentMethod,
  PaymentDateFilterPreset,
  PaymentFilters,
} from '@/types';

const paymentCreateSchema = z.object({
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date in YYYY-MM-DD format is required'),
  transaction_type: z.enum([
    'INCOME',
    'EXPENSE',
    'OWNER_WITHDRAWAL',
    'OWNER_CONTRIBUTION',
  ]),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(999999999.99, 'Amount exceeds maximum limit'),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(500).optional().nullable(),
  payment_method: z
    .enum(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER'])
    .default('CASH'),
  reference_number: z.string().max(100).optional().nullable(),
});

const paymentUpdateSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date in YYYY-MM-DD format is required')
    .optional(),
  transaction_type: z
    .enum(['INCOME', 'EXPENSE', 'OWNER_WITHDRAWAL', 'OWNER_CONTRIBUTION'])
    .optional(),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(999999999.99, 'Amount exceeds maximum limit')
    .optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  payment_method: z
    .enum(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER'])
    .optional(),
  reference_number: z.string().max(100).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const { searchParams } = new URL(req.url);

    const type = (searchParams.get('type') || 'ALL') as PaymentTransactionType | 'ALL';
    const category = searchParams.get('category') || undefined;
    const datePreset = (searchParams.get('datePreset') || 'this_month') as PaymentDateFilterPreset;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;

    const filters: PaymentFilters = {
      type,
      category,
      datePreset,
      startDate,
      endDate,
      search,
    };

    const [payments, summary] = await Promise.all([
      getPayments(filters),
      getPaymentSummary(filters),
    ]);

    return NextResponse.json({
      success: true,
      payments,
      summary,
    });
  } catch (error: any) {
    console.error('Failed to get payments:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch payment records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const rawBody = await req.json();

    const parsed = paymentCreateSchema.safeParse({
      ...rawBody,
      amount: typeof rawBody.amount === 'string' ? parseFloat(rawBody.amount) : rawBody.amount,
      category: rawBody.category?.trim(),
      description: rawBody.description?.trim() || null,
      reference_number: rawBody.reference_number?.trim() || null,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const newPayment = await createPayment({
      ...parsed.data,
      created_by: authCheck.session.userId,
      creator_name: authCheck.session.fullName || authCheck.session.email,
    });

    // Create Audit Log
    try {
      await createAuditLog({
        user_id: authCheck.session.userId,
        action: 'PAYMENT_CREATE',
        entity_type: 'PAYMENT',
        entity_id: newPayment.id,
        details: {
          transaction_type: newPayment.transaction_type,
          amount: newPayment.amount,
          category: newPayment.category,
          transaction_date: newPayment.transaction_date,
          payment_method: newPayment.payment_method,
        },
      });
    } catch (e) {
      console.warn('Could not record payment audit log:', e);
    }

    try {
      revalidatePath('/admin/payments');
      revalidatePath('/admin');
    } catch (e) {}

    return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create payment:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal error creating payment record' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const rawBody = await req.json();

    const parsed = paymentUpdateSchema.safeParse({
      ...rawBody,
      amount:
        rawBody.amount !== undefined
          ? typeof rawBody.amount === 'string'
            ? parseFloat(rawBody.amount)
            : rawBody.amount
          : undefined,
      category: rawBody.category !== undefined ? rawBody.category?.trim() : undefined,
      description:
        rawBody.description !== undefined ? rawBody.description?.trim() || null : undefined,
      reference_number:
        rawBody.reference_number !== undefined
          ? rawBody.reference_number?.trim() || null
          : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;

    const updated = await updatePayment(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found or update failed' },
        { status: 404 }
      );
    }

    // Create Audit Log
    try {
      await createAuditLog({
        user_id: authCheck.session.userId,
        action: 'PAYMENT_UPDATE',
        entity_type: 'PAYMENT',
        entity_id: id,
        details: { updates },
      });
    } catch (e) {
      console.warn('Could not record payment audit log:', e);
    }

    try {
      revalidatePath('/admin/payments');
      revalidatePath('/admin');
    } catch (e) {}

    return NextResponse.json({ success: true, payment: updated });
  } catch (error: any) {
    console.error('Failed to update payment:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal error updating payment record' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Payment ID parameter is required' },
        { status: 400 }
      );
    }

    const success = await deletePayment(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found or delete failed' },
        { status: 404 }
      );
    }

    // Create Audit Log
    try {
      await createAuditLog({
        user_id: authCheck.session.userId,
        action: 'PAYMENT_DELETE',
        entity_type: 'PAYMENT',
        entity_id: id,
      });
    } catch (e) {
      console.warn('Could not record payment audit log:', e);
    }

    try {
      revalidatePath('/admin/payments');
      revalidatePath('/admin');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Payment record deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete payment:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal error deleting payment record' },
      { status: 500 }
    );
  }
}
