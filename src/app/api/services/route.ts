import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getAllServicesAdmin,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from '@/lib/data/db';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { z } from 'zod';

const serviceSchema = z.object({
  title_en: z.string().min(2, 'English title is required'),
  title_ar: z.string().min(2, 'Arabic title is required'),
  slug_en: z.string().min(2, 'English slug is required'),
  slug_ar: z.string().min(2, 'Arabic slug is required'),
  short_desc_en: z.string().min(2, 'English short description is required'),
  short_desc_ar: z.string().min(2, 'Arabic short description is required'),
  description_en: z.string().min(5, 'Full English description is required'),
  description_ar: z.string().min(5, 'Full Arabic description is required'),
  icon_name: z.string().default('Wrench'),
  featured_image: z.string().min(1, 'Featured image is required'),
  before_image: z.string().optional().nullable(),
  after_image: z.string().optional().nullable(),
  before_caption_en: z.string().optional().nullable(),
  before_caption_ar: z.string().optional().nullable(),
  after_caption_en: z.string().optional().nullable(),
  after_caption_ar: z.string().optional().nullable(),
  before_alt_en: z.string().optional().nullable(),
  before_alt_ar: z.string().optional().nullable(),
  after_alt_en: z.string().optional().nullable(),
  after_alt_ar: z.string().optional().nullable(),
  gallery_images: z.array(z.string()).default([]),
  display_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
  seo_title_en: z.string().optional().nullable(),
  seo_title_ar: z.string().optional().nullable(),
  seo_desc_en: z.string().optional().nullable(),
  seo_desc_ar: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const services = await getAllServicesAdmin();
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error('Failed to get services:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const title_en = rawBody.title_en?.trim() || '';
    const title_ar = rawBody.title_ar?.trim() || title_en;
    const slug_en = (rawBody.slug_en?.trim() || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '') || 'service-' + Date.now();
    const slug_ar = rawBody.slug_ar?.trim() || slug_en;
    const short_desc_en = rawBody.short_desc_en?.trim() || title_en;
    const short_desc_ar = rawBody.short_desc_ar?.trim() || short_desc_en;
    const description_en = rawBody.description_en?.trim() || short_desc_en;
    const description_ar = rawBody.description_ar?.trim() || description_en;

    const body = {
      ...rawBody,
      title_en,
      title_ar,
      slug_en,
      slug_ar,
      short_desc_en,
      short_desc_ar,
      description_en,
      description_ar,
      featured_image: normalizeGoogleDriveUrl(rawBody.featured_image),
      before_image: rawBody.before_image && rawBody.before_image.trim() !== ''
        ? normalizeGoogleDriveUrl(rawBody.before_image)
        : null,
      after_image: rawBody.after_image && rawBody.after_image.trim() !== ''
        ? normalizeGoogleDriveUrl(rawBody.after_image)
        : null,
      gallery_images: Array.isArray(rawBody.gallery_images)
        ? rawBody.gallery_images.map(normalizeGoogleDriveUrl)
        : [],
      display_order: typeof rawBody.display_order === 'number' ? rawBody.display_order : parseInt(rawBody.display_order) || 0,
      is_published: rawBody.is_published ?? true,
    };

    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }

    const newService = await createServiceItem(parsed.data as any);
    try {
      revalidatePath('/[lang]/services', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/services/[slug]', 'page');
    } catch {}
    return NextResponse.json({ success: true, service: newService });
  } catch (error: any) {
    console.error('Failed to create service:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Service ID is required' }, { status: 400 });
    }

    if (updates.featured_image) {
      updates.featured_image = normalizeGoogleDriveUrl(updates.featured_image);
    }
    if (updates.before_image !== undefined) {
      updates.before_image = updates.before_image && updates.before_image.trim() !== ''
        ? normalizeGoogleDriveUrl(updates.before_image)
        : null;
    }
    if (updates.after_image !== undefined) {
      updates.after_image = updates.after_image && updates.after_image.trim() !== ''
        ? normalizeGoogleDriveUrl(updates.after_image)
        : null;
    }
    if (Array.isArray(updates.gallery_images)) {
      updates.gallery_images = updates.gallery_images.map(normalizeGoogleDriveUrl);
    }
    if (updates.display_order !== undefined) {
      updates.display_order = typeof updates.display_order === 'number' ? updates.display_order : parseInt(updates.display_order) || 0;
    }

    const updated = await updateServiceItem(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
    }

    try {
      revalidatePath('/[lang]/services', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/services/[slug]', 'page');
    } catch {}

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error('Failed to update service:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Service ID is required' }, { status: 400 });
    }

    const success = await deleteServiceItem(id);
    try {
      revalidatePath('/[lang]/services', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/services/[slug]', 'page');
    } catch {}
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Failed to delete service:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to delete service' }, { status: 500 });
  }
}
