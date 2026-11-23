import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/data/db';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { z } from 'zod';

const projectSchema = z.object({
  title_en: z.string().min(2, 'English title is required'),
  title_ar: z.string().min(2, 'Arabic title is required'),
  slug: z.string().min(2, 'Slug is required'),
  short_desc_en: z.string().optional().nullable(),
  short_desc_ar: z.string().optional().nullable(),
  desc_en: z.string().min(5, 'Full English description is required'),
  desc_ar: z.string().min(5, 'Full Arabic description is required'),
  vehicle_make: z.string().optional().nullable(),
  vehicle_model: z.string().optional().nullable(),
  vehicle_year: z.string().optional().nullable(),
  service_id: z.string().optional().nullable(),
  before_image: z.string().url('Valid Before image URL is required'),
  after_image: z.string().url('Valid After image URL is required'),
  gallery_images: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  display_order: z.number().int().default(1),
  seo_title_en: z.string().optional().nullable(),
  seo_title_ar: z.string().optional().nullable(),
  seo_desc_en: z.string().optional().nullable(),
  seo_desc_ar: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const projects = await getAllProjectsAdmin();
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('Failed to get portfolio projects:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      service_id: rawBody.service_id && typeof rawBody.service_id === 'string' && rawBody.service_id.length > 20
        ? rawBody.service_id
        : null,
      before_image: normalizeGoogleDriveUrl(rawBody.before_image),
      after_image: normalizeGoogleDriveUrl(rawBody.after_image),
      gallery_images: Array.isArray(rawBody.gallery_images)
        ? rawBody.gallery_images.map(normalizeGoogleDriveUrl)
        : [],
    };

    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }

    const newProject = await createProject(parsed.data as any);
    try {
      revalidatePath('/[lang]/our-work', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/our-work/[slug]', 'page');
    } catch {}
    return NextResponse.json({ success: true, project: newProject });
  } catch (error: any) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Project ID is required' }, { status: 400 });
    }

    if ('service_id' in updates) {
      updates.service_id = updates.service_id && typeof updates.service_id === 'string' && updates.service_id.length > 20
        ? updates.service_id
        : null;
    }
    if (updates.before_image) {
      updates.before_image = normalizeGoogleDriveUrl(updates.before_image);
    }
    if (updates.after_image) {
      updates.after_image = normalizeGoogleDriveUrl(updates.after_image);
    }
    if (Array.isArray(updates.gallery_images)) {
      updates.gallery_images = updates.gallery_images.map(normalizeGoogleDriveUrl);
    }

    const updated = await updateProject(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    try {
      revalidatePath('/[lang]/our-work', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/our-work/[slug]', 'page');
    } catch {}

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Project ID is required' }, { status: 400 });
    }

    const success = await deleteProject(id);
    try {
      revalidatePath('/[lang]/our-work', 'page');
      revalidatePath('/[lang]', 'page');
      revalidatePath('/[lang]/our-work/[slug]', 'page');
    } catch {}
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Failed to delete project' }, { status: 500 });
  }
}
