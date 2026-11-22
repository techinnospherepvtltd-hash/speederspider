import { NextRequest, NextResponse } from 'next/server';
import {
  getInventoryItems,
  getInventoryCategories,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryTransactions,
} from '@/lib/data/db';
import { z } from 'zod';

const itemSchema = z.object({
  name_en: z.string().min(2, 'English name is required'),
  name_ar: z.string().min(2, 'Arabic name is required'),
  sku: z.string().min(2, 'SKU is required').max(50),
  category_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  min_threshold: z.number().int().min(0, 'Minimum threshold cannot be negative'),
  cost_price: z.number().min(0, 'Cost price cannot be negative'),
  supplier: z.string().optional().nullable(),
  storage_location: z.string().optional().nullable(),
  status: z.enum(['active', 'discontinued', 'archived']).default('active'),
});

export async function GET() {
  try {
    const items = await getInventoryItems();
    const categories = await getInventoryCategories();
    const transactions = await getInventoryTransactions();
    return NextResponse.json({ success: true, items, categories, transactions });
  } catch (error) {
    console.error('Failed to get inventory:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }

    const newItem = await createInventoryItem(parsed.data);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ success: false, message: 'Failed to create inventory item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
    }

    const updatedItem = await updateInventoryItem(id, updates);
    if (!updatedItem) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Failed to update inventory item:', error);
    return NextResponse.json({ success: false, message: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Item ID is required' }, { status: 400 });
    }

    const success = await deleteInventoryItem(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Failed to delete inventory item:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete inventory item' }, { status: 500 });
  }
}
