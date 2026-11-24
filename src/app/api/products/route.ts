import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getProducts,
  getAllProductsAdmin,
  createProductItem,
  updateProductItem,
  deleteProductItem,
} from '@/lib/data/db';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { z } from 'zod';

const productSchema = z.object({
  name_en: z.string().min(2, 'Product name (English) is required'),
  name_ar: z.string().default(''),
  slug_en: z.string().default(''),
  slug_ar: z.string().default(''),
  brand_en: z.string().default('Not specified'),
  brand_ar: z.string().default('غير محدد'),
  price_en: z.string().default('Price on Request'),
  price_ar: z.string().default('السعر عند الطلب'),
  description_en: z.string().min(3, 'Description (English) is required'),
  description_ar: z.string().default(''),
  image_url: z.string().min(1, 'Product image is required'),
  category: z.string().optional().nullable().default('Accessories'),
  display_order: z.number().int().default(1),
  is_published: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const products = isAdmin
      ? await getAllProductsAdmin()
      : await getProducts();

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const name_en = rawBody.name_en?.trim() || '';
    const name_ar = rawBody.name_ar?.trim() || name_en;
    const description_en = rawBody.description_en?.trim() || '';
    const description_ar = rawBody.description_ar?.trim() || description_en;
    const brand_en = rawBody.brand_en?.trim() || 'Not specified';
    const brand_ar = rawBody.brand_ar?.trim() || (brand_en === 'Not specified' ? 'غير محدد' : brand_en);
    const price_en = rawBody.price_en?.trim() || 'Price on Request';
    const price_ar = rawBody.price_ar?.trim() || (price_en === 'Price on Request' ? 'السعر عند الطلب' : price_en);

    const slugBase = name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const parsed = productSchema.safeParse({
      ...rawBody,
      name_en,
      name_ar,
      slug_en: rawBody.slug_en?.trim() || slugBase,
      slug_ar: rawBody.slug_ar?.trim() || slugBase,
      brand_en,
      brand_ar,
      price_en,
      price_ar,
      description_en,
      description_ar,
      image_url: normalizeGoogleDriveUrl(rawBody.image_url),
      category: rawBody.category?.trim() || 'Accessories',
      display_order: Number(rawBody.display_order) || 1,
      is_published: rawBody.is_published ?? true,
      is_featured: rawBody.is_featured ?? false,
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

    const created = await createProductItem({
      ...parsed.data,
      slug_en: parsed.data.slug_en || slugBase,
      slug_ar: parsed.data.slug_ar || slugBase,
      category: parsed.data.category || 'Accessories',
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]/products', 'page');
      revalidatePath('/en/products');
      revalidatePath('/ar/products');
      revalidatePath('/admin/products');
    } catch (e) {}

    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error creating product' },
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
        { success: false, message: 'Product ID is required for updating' },
        { status: 400 }
      );
    }

    const updatePayload: any = { ...data };
    if (updatePayload.image_url) {
      updatePayload.image_url = normalizeGoogleDriveUrl(updatePayload.image_url);
    }
    if (updatePayload.display_order !== undefined) {
      updatePayload.display_order = Number(updatePayload.display_order) || 0;
    }
    if (updatePayload.is_published !== undefined) {
      updatePayload.is_published = Boolean(updatePayload.is_published);
    }
    if (updatePayload.is_featured !== undefined) {
      updatePayload.is_featured = Boolean(updatePayload.is_featured);
    }

    const updated = await updateProductItem(id, updatePayload);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Product not found or update failed' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]/products', 'page');
      revalidatePath('/en/products');
      revalidatePath('/ar/products');
      revalidatePath('/admin/products');
    } catch (e) {}

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error updating product' },
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
        { success: false, message: 'Product ID is required for deletion' },
        { status: 400 }
      );
    }

    const success = await deleteProductItem(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Product not found or delete failed' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]/products', 'page');
      revalidatePath('/en/products');
      revalidatePath('/ar/products');
      revalidatePath('/admin/products');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error deleting product' },
      { status: 500 }
    );
  }
}
