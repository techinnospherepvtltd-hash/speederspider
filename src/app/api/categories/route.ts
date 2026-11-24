import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/data/db';
import { z } from 'zod';

const categorySchema = z.object({
  name_en: z.string().min(2, 'Category name (English) is required'),
  name_ar: z.string().min(2, 'Category name (Arabic) is required'),
  slug: z.string().default(''),
  description: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Failed to get categories:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const name_en = rawBody.name_en?.trim() || '';
    const name_ar = rawBody.name_ar?.trim() || name_en;
    const slugBase = (rawBody.slug?.trim() || name_en)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const parsed = categorySchema.safeParse({
      ...rawBody,
      name_en,
      name_ar,
      slug: slugBase || 'cat-' + Date.now(),
      description: rawBody.description?.trim() || null,
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

    const created = await createCategory({
      ...parsed.data,
      slug: parsed.data.slug || slugBase || 'cat-' + Date.now(),
    });

    try {
      revalidatePath('/admin/categories');
      revalidatePath('/admin/inventory');
      revalidatePath('/admin/products');
      revalidatePath('/[lang]/products', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, category: created });
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error creating category' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { id, ...data } = rawBody;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required for updating' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, data);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Category not found or update failed' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/admin/categories');
      revalidatePath('/admin/inventory');
      revalidatePath('/admin/products');
      revalidatePath('/[lang]/products', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error updating category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required for deletion' },
        { status: 400 }
      );
    }

    const result = await deleteCategory(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to delete category' },
        { status: 400 }
      );
    }

    try {
      revalidatePath('/admin/categories');
      revalidatePath('/admin/inventory');
      revalidatePath('/admin/products');
      revalidatePath('/[lang]/products', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error deleting category' },
      { status: 500 }
    );
  }
}
