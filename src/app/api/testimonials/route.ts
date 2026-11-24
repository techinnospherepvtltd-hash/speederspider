import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getAllTestimonialsAdmin,
  createTestimonialItem,
  updateTestimonialItem,
  deleteTestimonialItem,
} from '@/lib/data/db';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { verifyAdminRouteAccess } from '@/lib/auth/session';
import { z } from 'zod';

const testimonialSchema = z.object({
  client_name_en: z.string().min(2, 'Client name (English) is required'),
  client_name_ar: z.string().default(''),
  vehicle_info: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  review_en: z.string().min(5, 'Review (English) is required'),
  review_ar: z.string().default(''),
  avatar_url: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
  display_order: z.number().int().default(1),
});

export async function GET() {
  try {
    const testimonials = await getAllTestimonialsAdmin();
    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    console.error('Failed to get testimonials:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const rawBody = await req.json();

    const client_name_en = rawBody.client_name_en?.trim() || '';
    const client_name_ar = rawBody.client_name_ar?.trim() || client_name_en;
    const review_en = rawBody.review_en?.trim() || '';
    const review_ar = rawBody.review_ar?.trim() || review_en;

    const parsed = testimonialSchema.safeParse({
      ...rawBody,
      client_name_en,
      client_name_ar,
      review_en,
      review_ar,
      avatar_url: rawBody.avatar_url && rawBody.avatar_url.trim() !== ''
        ? normalizeGoogleDriveUrl(rawBody.avatar_url)
        : null,
      rating: Number(rawBody.rating) || 5,
      display_order: Number(rawBody.display_order) || 1,
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

    const created = await createTestimonialItem({
      ...parsed.data,
      client_name_ar: parsed.data.client_name_ar || parsed.data.client_name_en,
      review_ar: parsed.data.review_ar || parsed.data.review_en,
    });

    // Revalidate affected pages
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/en');
      revalidatePath('/ar');
    } catch (e) {
      // safe in non-static contexts
    }

    return NextResponse.json({ success: true, testimonial: created });
  } catch (error: any) {
    console.error('Failed to create testimonial:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error creating testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await verifyAdminRouteAccess(req, ['owner', 'manager']);
    if (!authCheck.authorized) return authCheck.response;

    const rawBody = await req.json();
    const { id, ...data } = rawBody;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Testimonial ID is required for updating' },
        { status: 400 }
      );
    }

    const updatePayload: any = { ...data };
    if (updatePayload.avatar_url) {
      updatePayload.avatar_url = normalizeGoogleDriveUrl(updatePayload.avatar_url);
    }
    if (updatePayload.rating) {
      updatePayload.rating = Number(updatePayload.rating);
    }
    if (updatePayload.display_order) {
      updatePayload.display_order = Number(updatePayload.display_order);
    }

    const updated = await updateTestimonialItem(id, updatePayload);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found or update failed' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/en');
      revalidatePath('/ar');
    } catch (e) {}

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error: any) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error updating testimonial' },
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
        { success: false, message: 'Testimonial ID is required for deletion' },
        { status: 400 }
      );
    }

    const success = await deleteTestimonialItem(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/en');
      revalidatePath('/ar');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete testimonial:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error deleting testimonial' },
      { status: 500 }
    );
  }
}
