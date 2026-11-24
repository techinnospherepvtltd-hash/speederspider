import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeGoogleDriveUrl } from '@/lib/utils';
import { INITIAL_SERVICES, INITIAL_PROJECTS, INITIAL_TESTIMONIALS, INITIAL_PRODUCTS, INITIAL_INVENTORY, INITIAL_CATEGORIES } from '@/lib/data/mock-data';
import {
  ServiceItem,
  PortfolioProject,
  TestimonialItem,
  ProductItem,
  InventoryItem,
  InventoryCategory,
  InventoryTransaction,
  ContactMessage,
  EnquiryStatus,
  SiteSetting,
  AuditLog,
  PaymentItem,
  PaymentTransactionType,
  PaymentMethod,
  PaymentSummary,
  PaymentFilters,
  PaymentCategoryBreakdown,
  MonthlyCashFlow,
  PaymentDateFilterPreset,
} from '@/types';

// Helper to obtain authorized database client for mutations & admin queries
// Uses service_role client when available on server to bypass RLS, falling back to session client
async function getDbClient() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createServerSupabaseClient();
}

// In-memory runtime store for dynamic mutations during development if Supabase keys not set
let memoryServices: ServiceItem[] = [...INITIAL_SERVICES];
let memoryProjects: PortfolioProject[] = [...INITIAL_PROJECTS];
let memoryTestimonials: TestimonialItem[] = [...INITIAL_TESTIMONIALS];
let memoryProducts: ProductItem[] = [...INITIAL_PRODUCTS];
let memoryInventory: InventoryItem[] = [...INITIAL_INVENTORY];
let memoryCategories: InventoryCategory[] = [...INITIAL_CATEGORIES];
let memoryTransactions: InventoryTransaction[] = [];
let memoryAuditLogs: AuditLog[] = [];
let memoryPayments: PaymentItem[] = [];
let memoryEnquiries: ContactMessage[] = [
  {
    id: 'enq-1',
    customer_name: 'Rashid Al-Falasi',
    email: 'rashid.f@example.ae',
    phone: '+971 50 882 1923',
    service_id: 's1-upholstery',
    message: 'Looking to re-trim my 2022 Porsche 911 GT3 seats with black Alcantara and guards red stitching. Please share availability and estimated turnaround time.',
    preferred_language: 'en',
    status: 'new',
    internal_notes: 'Initial quotation requested. Follow up scheduled.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'enq-2',
    customer_name: 'Tareq Mansoor',
    email: 'tareq.m@example.com',
    phone: '+971 55 319 4410',
    service_id: 's3-tinting',
    message: 'استفسار عن تظليل عازل حراري نانو سيراميك لسيارة رنج روفر أوتوبيوغرافي، هل العازل يشمل فتحة البانوراما؟',
    preferred_language: 'ar',
    status: 'in_progress',
    internal_notes: 'Quotation of AED 2,200 sent via WhatsApp. Client confirmed appointment for Thursday.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
let memorySettings: Record<string, Record<string, unknown>> = {
  google_review_url: {
    url: '',
    is_enabled: false,
    label_en: 'Rate Us on Google',
    label_ar: 'قيّمنا على Google',
  },
};

// ==========================================
// SERVICES REPOSITORY
// ==========================================
const formatService = (s: ServiceItem): ServiceItem => ({
  ...s,
  featured_image: normalizeGoogleDriveUrl(s.featured_image),
  before_image: s.before_image ? normalizeGoogleDriveUrl(s.before_image) : null,
  after_image: s.after_image ? normalizeGoogleDriveUrl(s.after_image) : null,
  gallery_images: Array.isArray(s.gallery_images) ? s.gallery_images.map(normalizeGoogleDriveUrl) : [],
});

export async function getServices(): Promise<ServiceItem[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return (data as ServiceItem[]).map(formatService);
  }
  return memoryServices.filter(s => s.is_published).sort((a, b) => a.display_order - b.display_order).map(formatService);
}

export async function getAllServicesAdmin(): Promise<ServiceItem[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) return (data as ServiceItem[]).map(formatService);
  }
  return memoryServices.sort((a, b) => a.display_order - b.display_order).map(formatService);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .or(`slug_en.eq.${slug},slug_ar.eq.${slug}`)
      .single();
    if (!error && data) return formatService(data as ServiceItem);
  }
  const found = memoryServices.find(s => s.slug_en === slug || s.slug_ar === slug);
  return found ? formatService(found) : null;
}

export async function createServiceItem(service: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceItem> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();

  const cleanedService = {
    ...service,
    featured_image: normalizeGoogleDriveUrl(service.featured_image),
    before_image: service.before_image ? normalizeGoogleDriveUrl(service.before_image) : null,
    after_image: service.after_image ? normalizeGoogleDriveUrl(service.after_image) : null,
    gallery_images: Array.isArray(service.gallery_images)
      ? service.gallery_images.map(normalizeGoogleDriveUrl)
      : [],
    display_order: Number(service.display_order) || 0,
    is_published: service.is_published ?? true,
    icon_name: service.icon_name || 'Wrench',
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .insert(cleanedService)
      .select()
      .single();
    if (error) {
      console.error('Supabase createServiceItem error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) return data as ServiceItem;
  }

  const newService: ServiceItem = {
    ...cleanedService,
    id: 's-' + Math.random().toString(36).substring(2, 9),
    created_at: now,
    updated_at: now,
  };
  memoryServices.push(newService);
  return newService;
}

export async function updateServiceItem(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
  const supabase = await getDbClient();

  const cleanedUpdates: Record<string, unknown> = { ...updates };
  delete cleanedUpdates.id;
  delete cleanedUpdates.created_at;
  delete cleanedUpdates.updated_at;

  if (typeof cleanedUpdates.featured_image === 'string') {
    cleanedUpdates.featured_image = normalizeGoogleDriveUrl(cleanedUpdates.featured_image);
  }
  if (typeof cleanedUpdates.before_image === 'string') {
    cleanedUpdates.before_image = cleanedUpdates.before_image.trim() !== '' ? normalizeGoogleDriveUrl(cleanedUpdates.before_image) : null;
  }
  if (typeof cleanedUpdates.after_image === 'string') {
    cleanedUpdates.after_image = cleanedUpdates.after_image.trim() !== '' ? normalizeGoogleDriveUrl(cleanedUpdates.after_image) : null;
  }
  if (Array.isArray(cleanedUpdates.gallery_images)) {
    cleanedUpdates.gallery_images = cleanedUpdates.gallery_images.map(normalizeGoogleDriveUrl);
  }
  if (cleanedUpdates.display_order !== undefined) {
    cleanedUpdates.display_order = Number(cleanedUpdates.display_order) || 0;
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase updateServiceItem error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) return data as ServiceItem;
  }
  const index = memoryServices.findIndex(s => s.id === id);
  if (index !== -1) {
    memoryServices[index] = { ...memoryServices[index], ...cleanedUpdates, updated_at: new Date().toISOString() };
    return memoryServices[index];
  }
  return null;
}

export async function deleteServiceItem(id: string): Promise<boolean> {
  const supabase = await getDbClient();
  if (supabase) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Supabase deleteServiceItem error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    return true;
  }
  const index = memoryServices.findIndex(s => s.id === id);
  if (index !== -1) {
    memoryServices.splice(index, 1);
    return true;
  }
  return false;
}

// ==========================================
// PORTFOLIO REPOSITORY
// ==========================================
const formatProject = (p: PortfolioProject): PortfolioProject => ({
  ...p,
  before_image: normalizeGoogleDriveUrl(p.before_image),
  after_image: normalizeGoogleDriveUrl(p.after_image),
  gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images.map(normalizeGoogleDriveUrl) : [],
  service: p.service ? formatService(p.service as ServiceItem) : p.service,
});

export async function getProjects(): Promise<PortfolioProject[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .eq('is_published', true)
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return (data as PortfolioProject[]).map(formatProject);
  }
  return memoryProjects.filter(p => p.is_published).sort((a, b) => a.display_order - b.display_order).map(formatProject);
}

export async function getAllProjectsAdmin(): Promise<PortfolioProject[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .order('display_order', { ascending: true });
    if (!error && data) return (data as PortfolioProject[]).map(formatProject);
  }
  return memoryProjects.sort((a, b) => a.display_order - b.display_order).map(formatProject);
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  const projects = await getProjects();
  return projects.filter(p => p.is_featured);
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .eq('slug', slug)
      .single();
    if (!error && data) return formatProject(data as PortfolioProject);
  }
  const found = memoryProjects.find(p => p.slug === slug);
  return found ? formatProject(found) : null;
}

export async function createProject(project: Omit<PortfolioProject, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioProject> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();

  // Clean empty strings for UUID fields and normalize Google Drive image links
  const validServiceId = project.service_id && project.service_id.length > 20 ? project.service_id : null;
  const cleanedProject = {
    ...project,
    service_id: validServiceId,
    before_image: normalizeGoogleDriveUrl(project.before_image),
    after_image: normalizeGoogleDriveUrl(project.after_image),
    gallery_images: Array.isArray(project.gallery_images)
      ? project.gallery_images.map(normalizeGoogleDriveUrl)
      : [],
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert(cleanedProject)
      .select()
      .single();
    if (error) {
      console.error('Supabase createProject error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) return data as PortfolioProject;
  }

  const newProject: PortfolioProject = {
    ...cleanedProject,
    id: 'proj-' + Math.random().toString(36).substring(2, 9),
    created_at: now,
    updated_at: now,
  };
  memoryProjects.unshift(newProject);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject | null> {
  const supabase = await getDbClient();

  const cleanedUpdates: Record<string, unknown> = { ...updates };
  delete cleanedUpdates.id;
  delete cleanedUpdates.created_at;
  delete cleanedUpdates.updated_at;

  if (cleanedUpdates.service_id !== undefined) {
    cleanedUpdates.service_id = cleanedUpdates.service_id && (cleanedUpdates.service_id as string).length > 20
      ? cleanedUpdates.service_id
      : null;
  }
  if (typeof cleanedUpdates.before_image === 'string') {
    cleanedUpdates.before_image = normalizeGoogleDriveUrl(cleanedUpdates.before_image);
  }
  if (typeof cleanedUpdates.after_image === 'string') {
    cleanedUpdates.after_image = normalizeGoogleDriveUrl(cleanedUpdates.after_image);
  }
  if (Array.isArray(cleanedUpdates.gallery_images)) {
    cleanedUpdates.gallery_images = cleanedUpdates.gallery_images.map(normalizeGoogleDriveUrl);
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase updateProject error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) return data as PortfolioProject;
  }

  const index = memoryProjects.findIndex(p => p.id === id);
  if (index !== -1) {
    memoryProjects[index] = { ...memoryProjects[index], ...cleanedUpdates, updated_at: new Date().toISOString() };
    return memoryProjects[index];
  }
  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = await getDbClient();
  if (supabase) {
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Supabase deleteProject error:', error.message, error.details);
      throw new Error(`Database error: ${error.message}`);
    }
    return true;
  }
  const index = memoryProjects.findIndex(p => p.id === id);
  if (index !== -1) {
    memoryProjects.splice(index, 1);
    return true;
  }
  return false;
}

// ==========================================
// TESTIMONIALS REPOSITORY
// ==========================================
export async function getAllTestimonialsAdmin(): Promise<TestimonialItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return data as TestimonialItem[];
  }
  return memoryTestimonials.sort((a, b) => a.display_order - b.display_order);
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return data as TestimonialItem[];
  }
  return memoryTestimonials.filter(t => t.is_published).sort((a, b) => a.display_order - b.display_order);
}

export async function createTestimonialItem(item: Omit<TestimonialItem, 'id' | 'created_at'>): Promise<TestimonialItem> {
  const newId = 't-' + Date.now();
  const newItem: TestimonialItem = {
    ...item,
    id: newId,
    created_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(newItem)
      .select()
      .single();
    if (!error && data) {
      memoryTestimonials.push(data as TestimonialItem);
      return data as TestimonialItem;
    }
    if (error) console.error('Supabase create testimonial error:', error);
  }

  memoryTestimonials.push(newItem);
  return newItem;
}

export async function updateTestimonialItem(id: string, item: Partial<TestimonialItem>): Promise<TestimonialItem | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const idx = memoryTestimonials.findIndex(t => t.id === id);
      if (idx !== -1) memoryTestimonials[idx] = data as TestimonialItem;
      return data as TestimonialItem;
    }
    if (error) console.error('Supabase update testimonial error:', error);
  }

  const idx = memoryTestimonials.findIndex(t => t.id === id);
  if (idx !== -1) {
    memoryTestimonials[idx] = { ...memoryTestimonials[idx], ...item };
    return memoryTestimonials[idx];
  }
  return null;
}

export async function deleteTestimonialItem(id: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) console.error('Supabase delete testimonial error:', error);
  }

  const idx = memoryTestimonials.findIndex(t => t.id === id);
  if (idx !== -1) {
    memoryTestimonials.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// PRODUCTS REPOSITORY
// ==========================================
const formatProduct = (p: ProductItem): ProductItem => {
  const cat = memoryCategories.find(c => 
    (p.category_id && c.id === p.category_id) || 
    (p.category && (c.name_en.toLowerCase() === p.category.toLowerCase() || c.slug.toLowerCase() === p.category.toLowerCase()))
  );
  return {
    ...p,
    image_url: normalizeGoogleDriveUrl(p.image_url),
    category: cat ? cat.name_en : (p.category || 'Accessories'),
    category_id: p.category_id || (cat ? cat.id : null),
    category_rel: cat || null,
  };
};

export async function getProducts(): Promise<ProductItem[]> {
  const supabase = await getDbClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return (data as ProductItem[]).map(formatProduct);
    } catch (e) {
      // Fallback to memory store
    }
  }
  return memoryProducts
    .filter(p => p.is_published)
    .sort((a, b) => a.display_order - b.display_order)
    .map(formatProduct);
}

export async function getAllProductsAdmin(): Promise<ProductItem[]> {
  const supabase = await getDbClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return (data as ProductItem[]).map(formatProduct);
    } catch (e) {
      // Fallback to memory store
    }
  }
  return memoryProducts
    .sort((a, b) => a.display_order - b.display_order)
    .map(formatProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  const supabase = await getDbClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`slug_en.eq.${slug},slug_ar.eq.${slug},id.eq.${slug}`)
        .maybeSingle();
      if (!error && data) return formatProduct(data as ProductItem);
    } catch (e) {
      // Fallback to memory store
    }
  }
  const found = memoryProducts.find(p => p.slug_en === slug || p.slug_ar === slug || p.id === slug);
  return found ? formatProduct(found) : null;
}

export async function createProductItem(product: Omit<ProductItem, 'id' | 'created_at' | 'updated_at'>): Promise<ProductItem> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();
  const slugBase = (product.slug_en || product.name_en || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const newId = 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

  const matchedCat = memoryCategories.find(c => 
    (product.category_id && c.id === product.category_id) ||
    (product.category && (c.name_en.toLowerCase() === product.category.toLowerCase() || c.slug.toLowerCase() === product.category.toLowerCase()))
  );
  const resolvedCategory = matchedCat ? matchedCat.name_en : (product.category || 'Accessories');
  const resolvedCategoryId = matchedCat ? matchedCat.id : (product.category_id || null);

  const cleaned: ProductItem = {
    ...product,
    id: newId,
    category: resolvedCategory,
    category_id: resolvedCategoryId,
    image_url: normalizeGoogleDriveUrl(product.image_url),
    slug_en: product.slug_en || slugBase,
    slug_ar: product.slug_ar || slugBase,
    display_order: Number(product.display_order) || 1,
    is_published: product.is_published ?? true,
    is_featured: product.is_featured ?? false,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(cleaned)
        .select()
        .single();
      if (!error && data) {
        const formatted = formatProduct(data as ProductItem);
        memoryProducts.push(formatted);
        return formatted;
      }
      if (error) console.error('Supabase createProductItem error:', error.message);
    } catch (e) {
      console.error('Supabase exception creating product:', e);
    }
  }

  const formatted = formatProduct(cleaned);
  memoryProducts.push(formatted);
  return formatted;
}

export async function updateProductItem(id: string, updates: Partial<ProductItem>): Promise<ProductItem | null> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();
  const cleanedUpdates: Record<string, unknown> = { ...updates, updated_at: now };
  delete cleanedUpdates.id;
  delete cleanedUpdates.created_at;

  if (typeof cleanedUpdates.image_url === 'string') {
    cleanedUpdates.image_url = normalizeGoogleDriveUrl(cleanedUpdates.image_url);
  }
  if (cleanedUpdates.display_order !== undefined) {
    cleanedUpdates.display_order = Number(cleanedUpdates.display_order) || 0;
  }
  if (cleanedUpdates.category || cleanedUpdates.category_id) {
    const matchedCat = memoryCategories.find(c => 
      (cleanedUpdates.category_id && c.id === cleanedUpdates.category_id) ||
      (cleanedUpdates.category && (c.name_en.toLowerCase() === String(cleanedUpdates.category).toLowerCase() || c.slug.toLowerCase() === String(cleanedUpdates.category).toLowerCase()))
    );
    if (matchedCat) {
      cleanedUpdates.category = matchedCat.name_en;
      cleanedUpdates.category_id = matchedCat.id;
    }
  }

  let updatedInDb = false;
  let dbResult: ProductItem | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(cleanedUpdates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        updatedInDb = true;
        dbResult = data as ProductItem;
      } else if (error) {
        console.error('Supabase updateProductItem error:', error.message);
      }
    } catch (e) {
      console.error('Supabase exception updating product:', e);
    }
  }

  const index = memoryProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    memoryProducts[index] = {
      ...memoryProducts[index],
      ...cleanedUpdates,
      ...(dbResult || {}),
      updated_at: now,
    };
    return formatProduct(memoryProducts[index]);
  }

  if (updatedInDb && dbResult) {
    memoryProducts.push(dbResult);
    return formatProduct(dbResult);
  }

  return null;
}

export async function deleteProductItem(id: string): Promise<boolean> {
  const supabase = await getDbClient();
  let deletedInDb = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (!error) deletedInDb = true;
      else console.error('Supabase deleteProductItem error:', error.message);
    } catch (e) {
      console.error('Supabase exception deleting product:', e);
    }
  }

  const index = memoryProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    memoryProducts.splice(index, 1);
    return true;
  }
  return deletedInDb;
}

// ==========================================
// CATEGORIES REPOSITORY (UNIFIED FOR ALL MODULES)
// ==========================================
export async function getCategories(): Promise<InventoryCategory[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    // 1. Try unified public.categories table first
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name_en', { ascending: true });
      if (!error && data && data.length > 0) {
        memoryCategories = data as InventoryCategory[];
        return data as InventoryCategory[];
      }
    } catch (e) {}

    // 2. Fall back to public.inventory_categories table
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name_en', { ascending: true });
      if (!error && data && data.length > 0) {
        memoryCategories = data as InventoryCategory[];
        return data as InventoryCategory[];
      }
    } catch (e) {}
  }
  return memoryCategories.sort((a, b) => a.name_en.localeCompare(b.name_en));
}

// Backward compatibility alias
export const getInventoryCategories = getCategories;

export async function createCategory(cat: Omit<InventoryCategory, 'id' | 'created_at'>): Promise<InventoryCategory> {
  const supabase = await getDbClient();
  const slug = (cat.slug || cat.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'cat-' + Date.now();
  const payload = {
    name_en: cat.name_en.trim(),
    name_ar: (cat.name_ar || cat.name_en).trim(),
    slug,
    description: cat.description ? cat.description.trim() : null,
  };

  if (supabase) {
    // Try inserting into public.categories first
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        memoryCategories.push(data as InventoryCategory);
        // Also sync into inventory_categories
        try { await supabase.from('inventory_categories').insert(payload); } catch (e) {}
        return data as InventoryCategory;
      }
    } catch (e) {}

    // Fall back to inserting into public.inventory_categories
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        memoryCategories.push(data as InventoryCategory);
        return data as InventoryCategory;
      }
      if (error) console.error('Supabase createCategory error:', error.message);
    } catch (e) {
      console.error('Supabase exception creating category:', e);
    }
  }

  const newId = 'c-' + Date.now().toString(36);
  const newCat: InventoryCategory = {
    ...payload,
    id: newId,
    created_at: new Date().toISOString(),
  };
  memoryCategories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<InventoryCategory>): Promise<InventoryCategory | null> {
  const supabase = await getDbClient();
  const oldCat = memoryCategories.find(c => c.id === id);
  const cleaned: any = {};
  if (updates.name_en !== undefined) cleaned.name_en = updates.name_en.trim();
  if (updates.name_ar !== undefined) cleaned.name_ar = updates.name_ar.trim();
  if (updates.slug !== undefined) cleaned.slug = updates.slug.trim();
  if (updates.description !== undefined) cleaned.description = updates.description ? updates.description.trim() : null;

  let dbResult: InventoryCategory | null = null;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(cleaned)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        dbResult = data as InventoryCategory;
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .update(cleaned)
        .eq('id', id)
        .select()
        .single();
      if (!error && data && !dbResult) {
        dbResult = data as InventoryCategory;
      }
    } catch (e) {}

    // Cascade name_en update to products table if category name changed
    if (oldCat && cleaned.name_en && cleaned.name_en !== oldCat.name_en) {
      try {
        await supabase
          .from('products')
          .update({ category: cleaned.name_en })
          .or(`category_id.eq.${id},category.eq.${oldCat.name_en}`);
      } catch (e) {}
    }
  }

  // Cascade to memory products
  if (oldCat && cleaned.name_en && cleaned.name_en !== oldCat.name_en) {
    memoryProducts.forEach(p => {
      if (p.category_id === id || p.category === oldCat.name_en) {
        p.category = cleaned.name_en;
      }
    });
  }

  const idx = memoryCategories.findIndex(c => c.id === id);
  if (idx !== -1) {
    memoryCategories[idx] = { ...memoryCategories[idx], ...cleaned, ...(dbResult || {}) };
    return memoryCategories[idx];
  }
  if (dbResult) {
    memoryCategories.push(dbResult);
    return dbResult;
  }
  return null;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await getDbClient();
  const catToDelete = memoryCategories.find(c => c.id === id);

  let invCount = 0;
  let prodCount = 0;

  if (supabase) {
    try {
      const { count: iCount } = await supabase
        .from('inventory_items')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);
      invCount = iCount || 0;

      const { count: pCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .or(`category_id.eq.${id},category.eq.${catToDelete?.name_en || ''}`);
      prodCount = pCount || 0;
    } catch (e: any) {
      console.error('Supabase count check error deleting category:', e);
    }
  }

  const memInvCount = memoryInventory.filter(i => i.category_id === id).length;
  const memProdCount = memoryProducts.filter(p => p.category_id === id || (catToDelete && p.category === catToDelete.name_en)).length;

  const totalInv = Math.max(invCount, memInvCount);
  const totalProd = Math.max(prodCount, memProdCount);

  if (totalInv > 0 || totalProd > 0) {
    const reasons: string[] = [];
    if (totalProd > 0) reasons.push(`${totalProd} product(s)`);
    if (totalInv > 0) reasons.push(`${totalInv} inventory item(s)`);
    return {
      success: false,
      message: `Cannot delete category "${catToDelete?.name_en || id}": ${reasons.join(' and ')} are currently assigned to it. Please reassign or delete them first.`,
    };
  }

  if (supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {}

    try {
      await supabase.from('inventory_categories').delete().eq('id', id);
    } catch (e) {}
  }

  const idx = memoryCategories.findIndex(c => c.id === id);
  if (idx !== -1) {
    memoryCategories.splice(idx, 1);
  }
  return { success: true };
}

// ==========================================
// INVENTORY REPOSITORY (MANUAL CONTROL - NO AUTO SEEDING)
// ==========================================

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, category:inventory_categories(*)')
      .order('name_en', { ascending: true });
    if (!error && data) return data as InventoryItem[];
  }
  return memoryInventory.map(item => ({
    ...item,
    category: memoryCategories.find(c => c.id === item.category_id)
  }));
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();
  const validCategoryId = item.category_id && item.category_id.length > 20 ? item.category_id : null;
  const cleanedItem = {
    ...item,
    category_id: validCategoryId,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(cleanedItem)
      .select()
      .single();
    if (error) {
      console.error('Supabase createInventoryItem error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) {
      memoryInventory.unshift(data as InventoryItem);
      return data as InventoryItem;
    }
  }

  const newItem: InventoryItem = {
    ...cleanedItem,
    id: 'inv-' + Math.random().toString(36).substring(2, 9),
    created_at: now,
    updated_at: now,
  };
  memoryInventory.unshift(newItem);
  return newItem;
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
  const supabase = await getDbClient();
  const cleanedUpdates: Record<string, unknown> = { ...updates };
  delete cleanedUpdates.id;
  delete cleanedUpdates.created_at;
  delete cleanedUpdates.updated_at;

  if (cleanedUpdates.category_id !== undefined) {
    cleanedUpdates.category_id = cleanedUpdates.category_id && (cleanedUpdates.category_id as string).length > 20
      ? cleanedUpdates.category_id
      : null;
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase updateInventoryItem error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    if (data) return data as InventoryItem;
  }
  const index = memoryInventory.findIndex(i => i.id === id);
  if (index !== -1) {
    memoryInventory[index] = { ...memoryInventory[index], ...cleanedUpdates, updated_at: new Date().toISOString() };
    return memoryInventory[index];
  }
  return null;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const supabase = await getDbClient();
  if (supabase) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Supabase deleteInventoryItem error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    return true;
  }
  const index = memoryInventory.findIndex(i => i.id === id);
  if (index !== -1) {
    memoryInventory.splice(index, 1);
    return true;
  }
  return false;
}

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*, item:inventory_items(*)')
      .order('created_at', { ascending: false });
    if (!error && data) return data as InventoryTransaction[];
  }
  return memoryTransactions;
}

export async function executeStockChange(
  itemId: string,
  type: 'stock_in' | 'stock_out' | 'adjustment',
  qty: number,
  reason: string,
  performedBy: string = 'Active Workshop Supervisor'
): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();

  // 1. If Supabase is available, check and execute in Supabase first
  if (supabase) {
    try {
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*, category:inventory_categories(*)')
        .eq('id', itemId)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase fetch inventory item error:', fetchError);
      }

      if (currentItem) {
        const currentQty = Number(currentItem.quantity) || 0;
        let newQty = currentQty;
        let qtyDelta = 0;

        if (type === 'stock_in') {
          if (qty <= 0) return { success: false, error: 'Stock in quantity must be positive' };
          newQty = currentQty + qty;
          qtyDelta = qty;
        } else if (type === 'stock_out') {
          if (qty <= 0) return { success: false, error: 'Stock out quantity must be positive' };
          if (currentQty < qty) {
            return { success: false, error: `Insufficient stock (Available: ${currentQty})` };
          }
          newQty = currentQty - qty;
          qtyDelta = -qty;
        } else if (type === 'adjustment') {
          if (qty < 0) return { success: false, error: 'Adjusted stock quantity cannot be negative' };
          qtyDelta = qty - currentQty;
          newQty = qty;
        }

        // Update item quantity in Supabase
        const { data: updatedItem, error: updateError } = await supabase
          .from('inventory_items')
          .update({ quantity: newQty, updated_at: now })
          .eq('id', itemId)
          .select('*, category:inventory_categories(*)')
          .single();

        if (updateError) {
          console.error('Supabase update item quantity error:', updateError);
          return { success: false, error: updateError.message };
        }

        // Insert transaction log
        const isUuid = performedBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(performedBy);
        const { error: txError } = await supabase
          .from('inventory_transactions')
          .insert({
            item_id: itemId,
            transaction_type: type,
            quantity_changed: qtyDelta,
            resulting_quantity: newQty,
            reason,
            performed_by: isUuid ? performedBy : null,
            notes: isUuid ? null : `Supervisor: ${performedBy}`,
            created_at: now,
          });

        if (txError) {
          console.error('Supabase insert transaction error, falling back to minimal payload:', txError);
          try {
            await supabase.from('inventory_transactions').insert({
              item_id: itemId,
              transaction_type: type,
              quantity_changed: qtyDelta,
              resulting_quantity: newQty,
              reason,
              created_at: now,
            });
          } catch (fallbackErr) {
            console.error('Fallback transaction insert error:', fallbackErr);
          }
        }

        // Keep local memory in sync if item exists there
        const memIdx = memoryInventory.findIndex(i => i.id === itemId);
        if (memIdx !== -1) {
          memoryInventory[memIdx] = { ...memoryInventory[memIdx], quantity: newQty, updated_at: now };
        }

        return { success: true, item: (updatedItem || { ...currentItem, quantity: newQty, updated_at: now }) as InventoryItem };
      }
    } catch (e: any) {
      console.error('Supabase stock change execution error:', e);
    }
  }

  // 2. Check memoryInventory fallback
  const itemIndex = memoryInventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false, error: 'Item not found' };

  const current = memoryInventory[itemIndex];
  let newQty = current.quantity;
  let qtyDelta = 0;

  if (type === 'stock_in') {
    if (qty <= 0) return { success: false, error: 'Stock in quantity must be positive' };
    newQty += qty;
    qtyDelta = qty;
  } else if (type === 'stock_out') {
    if (qty <= 0) return { success: false, error: 'Stock out quantity must be positive' };
    if (current.quantity < qty) {
      return { success: false, error: `Insufficient stock (Available: ${current.quantity})` };
    }
    newQty -= qty;
    qtyDelta = -qty;
  } else if (type === 'adjustment') {
    if (qty < 0) return { success: false, error: 'Adjusted stock quantity cannot be negative' };
    qtyDelta = qty - current.quantity;
    newQty = qty;
  }

  memoryInventory[itemIndex] = {
    ...current,
    quantity: newQty,
    updated_at: now,
  };

  const tx: InventoryTransaction = {
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    item_id: itemId,
    transaction_type: type,
    quantity_changed: qtyDelta,
    resulting_quantity: newQty,
    reason,
    performed_by: performedBy,
    created_at: now,
  };
  memoryTransactions.unshift(tx);

  return { success: true, item: memoryInventory[itemIndex] };
}

// ==========================================
// CONTACT ENQUIRIES REPOSITORY
// ==========================================
export async function getEnquiries(): Promise<ContactMessage[]> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false });
    if (!error && data) return data as ContactMessage[];
  }
  return memoryEnquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>): Promise<ContactMessage> {
  const supabase = await getDbClient();
  const newMsg: ContactMessage = {
    ...msg,
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(msg)
      .select()
      .single();
    if (!error && data) return data as ContactMessage;
  }

  memoryEnquiries.unshift(newMsg);
  return newMsg;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus, internalNotes?: string): Promise<boolean> {
  const supabase = await getDbClient();
  let updatedInDb = false;

  if (supabase) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (internalNotes !== undefined) {
      updateData.internal_notes = internalNotes;
    }
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update enquiry status error:', error);
    } else if (data && data.length > 0) {
      updatedInDb = true;
    }
  }

  const index = memoryEnquiries.findIndex(e => e.id === id);
  if (index !== -1) {
    memoryEnquiries[index].status = status;
    if (internalNotes !== undefined) {
      memoryEnquiries[index].internal_notes = internalNotes;
    }
    memoryEnquiries[index].updated_at = new Date().toISOString();
    return true;
  }

  return updatedInDb;
}

// ==========================================
// SITE SETTINGS REPOSITORY (GOOGLE REVIEWS & CONFIG)
// ==========================================
export async function getGoogleReviewSettings(): Promise<{ url: string; is_enabled: boolean; label_en: string; label_ar: string }> {
  const supabase = await getDbClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'google_review_url')
      .single();
    if (!error && data && data.value) {
      return data.value as { url: string; is_enabled: boolean; label_en: string; label_ar: string };
    }
  }
  return memorySettings.google_review_url as { url: string; is_enabled: boolean; label_en: string; label_ar: string };
}

export async function updateGoogleReviewSettings(settings: { url: string; is_enabled: boolean; label_en?: string; label_ar?: string }): Promise<boolean> {
  const updated = {
    ...memorySettings.google_review_url,
    ...settings,
  };
  memorySettings.google_review_url = updated;

  const supabase = await getDbClient();
  if (supabase) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'google_review_url',
        value: updated,
        updated_at: new Date().toISOString(),
      });
    return !error;
  }
  return true;
}

// ==========================================
// SECURITY & AUDIT LOGS REPOSITORY
// ==========================================
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
  const supabase = await getDbClient();
  const newLog: AuditLog = {
    ...log,
    id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: log.user_id || null,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id || null,
          details: log.details || null,
          ip_address: log.ip_address || null,
        })
        .select()
        .single();
      if (!error && data) {
        memoryAuditLogs.unshift(data as AuditLog);
        return data as AuditLog;
      }
    } catch (e) {
      // Fallback to memory
    }
  }

  memoryAuditLogs.unshift(newLog);
  return newLog;
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const supabase = await getDbClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data && data.length > 0) {
        return data as AuditLog[];
      }
    } catch (e) {
      // Fallback to memory
    }
  }

  return memoryAuditLogs.slice(0, limit);
}

// ==========================================
// PAYMENTS & FINANCIAL TRACKER REPOSITORY
// ==========================================

export function getDateRangeFromPreset(
  preset?: PaymentDateFilterPreset,
  customStart?: string,
  customEnd?: string
): { start?: string; end?: string } {
  if (!preset || preset === 'all') {
    return {};
  }
  const now = new Date();
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (preset === 'today') {
    const todayStr = formatYMD(now);
    return { start: todayStr, end: todayStr };
  }

  if (preset === 'this_week') {
    // Current week: Monday to Sunday
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatYMD(monday), end: formatYMD(sunday) };
  }

  if (preset === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: formatYMD(startOfMonth), end: formatYMD(endOfMonth) };
  }

  if (preset === 'last_month') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: formatYMD(startOfLastMonth), end: formatYMD(endOfLastMonth) };
  }

  if (preset === 'custom') {
    return {
      start: customStart ? customStart.split('T')[0] : undefined,
      end: customEnd ? customEnd.split('T')[0] : undefined,
    };
  }

  return {};
}

export async function getPayments(filters?: PaymentFilters): Promise<PaymentItem[]> {
  const supabase = await getDbClient();
  const { start, end } = getDateRangeFromPreset(filters?.datePreset, filters?.startDate, filters?.endDate);

  if (supabase) {
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'ALL') {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters?.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (start) {
        query = query.gte('transaction_date', start);
      }
      if (end) {
        query = query.lte('transaction_date', end);
      }
      if (filters?.search && filters.search.trim()) {
        const s = filters.search.trim();
        query = query.or(`description.ilike.%${s}%,reference_number.ilike.%${s}%,category.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return (data as any[]).map((p) => ({
          ...p,
          amount: Number(p.amount) || 0,
        })) as PaymentItem[];
      }
    } catch (e) {
      // Fallback to memory
    }
  }

  return memoryPayments
    .filter((p) => {
      if (filters?.type && filters.type !== 'ALL' && p.transaction_type !== filters.type) return false;
      if (filters?.category && filters.category !== 'ALL' && p.category !== filters.category) return false;
      if (start && p.transaction_date < start) return false;
      if (end && p.transaction_date > end) return false;
      if (filters?.search && filters.search.trim()) {
        const term = filters.search.toLowerCase().trim();
        const desc = (p.description || '').toLowerCase();
        const ref = (p.reference_number || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        if (!desc.includes(term) && !ref.includes(term) && !cat.includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateComp = b.transaction_date.localeCompare(a.transaction_date);
      if (dateComp !== 0) return dateComp;
      return b.created_at.localeCompare(a.created_at);
    });
}

export async function createPayment(
  payment: Omit<PaymentItem, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentItem> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();
  const newId = 'pay-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const cleanAmount = Number(Number(payment.amount).toFixed(2));

  const newPayment: PaymentItem = {
    ...payment,
    id: newId,
    amount: cleanAmount,
    description: payment.description?.trim() || null,
    reference_number: payment.reference_number?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          transaction_date: newPayment.transaction_date,
          transaction_type: newPayment.transaction_type,
          amount: newPayment.amount,
          category: newPayment.category,
          description: newPayment.description,
          payment_method: newPayment.payment_method,
          reference_number: newPayment.reference_number,
          created_by: newPayment.created_by || null,
        })
        .select()
        .single();
      if (!error && data) {
        const item: PaymentItem = {
          ...(data as any),
          amount: Number(data.amount) || 0,
        };
        memoryPayments.unshift(item);
        return item;
      }
    } catch (e) {
      // Fallback
    }
  }

  memoryPayments.unshift(newPayment);
  return newPayment;
}

export async function updatePayment(
  id: string,
  updates: Partial<Omit<PaymentItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<PaymentItem | null> {
  const supabase = await getDbClient();
  const now = new Date().toISOString();

  const cleanUpdates: Record<string, unknown> = {
    ...updates,
    updated_at: now,
  };
  if (updates.amount !== undefined) {
    cleanUpdates.amount = Number(Number(updates.amount).toFixed(2));
  }
  if (updates.description !== undefined) {
    cleanUpdates.description = updates.description?.trim() || null;
  }
  if (updates.reference_number !== undefined) {
    cleanUpdates.reference_number = updates.reference_number?.trim() || null;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated: PaymentItem = {
          ...(data as any),
          amount: Number(data.amount) || 0,
        };
        const idx = memoryPayments.findIndex((p) => p.id === id);
        if (idx !== -1) {
          memoryPayments[idx] = updated;
        } else {
          memoryPayments.unshift(updated);
        }
        return updated;
      }
    } catch (e) {
      // Fallback
    }
  }

  const idx = memoryPayments.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  memoryPayments[idx] = {
    ...memoryPayments[idx],
    ...cleanUpdates,
    updated_at: now,
  } as PaymentItem;
  return memoryPayments[idx];
}

export async function deletePayment(id: string): Promise<boolean> {
  const supabase = await getDbClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (!error) {
        memoryPayments = memoryPayments.filter((p) => p.id !== id);
        return true;
      }
    } catch (e) {
      // Fallback
    }
  }

  const beforeLen = memoryPayments.length;
  memoryPayments = memoryPayments.filter((p) => p.id !== id);
  return memoryPayments.length < beforeLen;
}

export async function getPaymentSummary(filters?: PaymentFilters): Promise<PaymentSummary> {
  const dateFilters: PaymentFilters = {
    datePreset: filters?.datePreset,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    search: filters?.search,
  };

  const payments = await getPayments(dateFilters);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalWithdrawals = 0;
  let totalContributions = 0;

  const expenseCategoryMap: Record<string, { amount: number; count: number }> = {};
  const incomeCategoryMap: Record<string, { amount: number; count: number }> = {};
  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  for (const p of payments) {
    const amt = Number(p.amount) || 0;
    const cat = p.category || 'General';
    const monthKey = p.transaction_date ? p.transaction_date.slice(0, 7) : new Date().toISOString().slice(0, 7);

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expense: 0 };
    }

    switch (p.transaction_type) {
      case 'INCOME':
        totalIncome += amt;
        monthlyMap[monthKey].income += amt;
        if (!incomeCategoryMap[cat]) incomeCategoryMap[cat] = { amount: 0, count: 0 };
        incomeCategoryMap[cat].amount += amt;
        incomeCategoryMap[cat].count += 1;
        break;
      case 'EXPENSE':
        totalExpenses += amt;
        monthlyMap[monthKey].expense += amt;
        if (!expenseCategoryMap[cat]) expenseCategoryMap[cat] = { amount: 0, count: 0 };
        expenseCategoryMap[cat].amount += amt;
        expenseCategoryMap[cat].count += 1;
        break;
      case 'OWNER_WITHDRAWAL':
        totalWithdrawals += amt;
        break;
      case 'OWNER_CONTRIBUTION':
        totalContributions += amt;
        break;
    }
  }

  totalIncome = Number(totalIncome.toFixed(2));
  totalExpenses = Number(totalExpenses.toFixed(2));
  totalWithdrawals = Number(totalWithdrawals.toFixed(2));
  totalContributions = Number(totalContributions.toFixed(2));

  // Net Operating Cash Flow = Income - Expenses
  const netOperatingCashFlow = Number((totalIncome - totalExpenses).toFixed(2));

  // Net Cash Movement = Income + Owner Contributions - Expenses - Owner Withdrawals
  const netCashMovement = Number(
    (totalIncome + totalContributions - totalExpenses - totalWithdrawals).toFixed(2)
  );

  const spendingByCategory: PaymentCategoryBreakdown[] = Object.entries(expenseCategoryMap)
    .map(([category, data]) => ({
      category,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalExpenses > 0 ? Number(((data.amount / totalExpenses) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const incomeByCategory: PaymentCategoryBreakdown[] = Object.entries(incomeCategoryMap)
    .map(([category, data]) => ({
      category,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalIncome > 0 ? Number(((data.amount / totalIncome) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyComparison: MonthlyCashFlow[] = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => {
      const [year, mStr] = month.split('-');
      const mIdx = parseInt(mStr, 10) - 1;
      const label = `${monthNames[mIdx] || mStr} ${year}`;
      const inc = Number(data.income.toFixed(2));
      const exp = Number(data.expense.toFixed(2));
      return {
        month,
        label,
        income: inc,
        expense: exp,
        netOperating: Number((inc - exp).toFixed(2)),
      };
    });

  return {
    totalIncome,
    totalExpenses,
    totalWithdrawals,
    totalContributions,
    netOperatingCashFlow,
    netCashMovement,
    transactionCount: payments.length,
    spendingByCategory,
    incomeByCategory,
    monthlyComparison,
  };
}
