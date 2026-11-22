import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_SERVICES, INITIAL_PROJECTS, INITIAL_TESTIMONIALS, INITIAL_INVENTORY, INITIAL_CATEGORIES } from '@/lib/data/mock-data';
import { ServiceItem, PortfolioProject, TestimonialItem, InventoryItem, InventoryCategory, ContactMessage, EnquiryStatus } from '@/types';

// In-memory runtime store for dynamic mutations during development if Supabase keys not set
let memoryServices: ServiceItem[] = [...INITIAL_SERVICES];
let memoryProjects: PortfolioProject[] = [...INITIAL_PROJECTS];
let memoryTestimonials: TestimonialItem[] = [...INITIAL_TESTIMONIALS];
let memoryInventory: InventoryItem[] = [...INITIAL_INVENTORY];
let memoryCategories: InventoryCategory[] = [...INITIAL_CATEGORIES];
let memoryEnquiries: ContactMessage[] = [];

// ==========================================
// SERVICES REPOSITORY
// ==========================================
export async function getServices(): Promise<ServiceItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return data as ServiceItem[];
  }
  return memoryServices.filter(s => s.is_published).sort((a, b) => a.display_order - b.display_order);
}

export async function getAllServicesAdmin(): Promise<ServiceItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) return data as ServiceItem[];
  }
  return memoryServices.sort((a, b) => a.display_order - b.display_order);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .or(`slug_en.eq.${slug},slug_ar.eq.${slug}`)
      .single();
    if (!error && data) return data as ServiceItem;
  }
  return memoryServices.find(s => s.slug_en === slug || s.slug_ar === slug) || null;
}

export async function updateServiceItem(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as ServiceItem;
  }
  const index = memoryServices.findIndex(s => s.id === id);
  if (index !== -1) {
    memoryServices[index] = { ...memoryServices[index], ...updates, updated_at: new Date().toISOString() };
    return memoryServices[index];
  }
  return null;
}

// ==========================================
// PORTFOLIO REPOSITORY
// ==========================================
export async function getProjects(): Promise<PortfolioProject[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return data as PortfolioProject[];
  }
  return memoryProjects.filter(p => p.is_published).sort((a, b) => a.display_order - b.display_order);
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  const projects = await getProjects();
  return projects.filter(p => p.is_featured);
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .eq('slug', slug)
      .single();
    if (!error && data) return data as PortfolioProject;
  }
  return memoryProjects.find(p => p.slug === slug) || null;
}

// ==========================================
// TESTIMONIALS REPOSITORY
// ==========================================
export async function getTestimonials(): Promise<TestimonialItem[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) return data as TestimonialItem[];
  }
  return memoryTestimonials.filter(t => t.is_published).sort((a, b) => a.display_order - b.display_order);
}

// ==========================================
// INVENTORY REPOSITORY
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

export async function executeStockChange(
  itemId: string,
  type: 'stock_in' | 'stock_out' | 'adjustment',
  qty: number,
  reason: string
): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
  const itemIndex = memoryInventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return { success: false, error: 'Item not found' };

  const current = memoryInventory[itemIndex];
  let newQty = current.quantity;

  if (type === 'stock_in') {
    newQty += qty;
  } else if (type === 'stock_out') {
    if (current.quantity < qty) {
      return { success: false, error: `Insufficient stock (Available: ${current.quantity})` };
    }
    newQty -= qty;
  } else if (type === 'adjustment') {
    newQty = qty;
  }

  memoryInventory[itemIndex] = {
    ...current,
    quantity: newQty,
    updated_at: new Date().toISOString()
  };

  return { success: true, item: memoryInventory[itemIndex] };
}

// ==========================================
// CONTACT ENQUIRIES REPOSITORY
// ==========================================
export async function getEnquiries(): Promise<ContactMessage[]> {
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
  const index = memoryEnquiries.findIndex(e => e.id === id);
  if (index !== -1) {
    memoryEnquiries[index].status = status;
    if (internalNotes !== undefined) {
      memoryEnquiries[index].internal_notes = internalNotes;
    }
    memoryEnquiries[index].updated_at = new Date().toISOString();
    return true;
  }
  return false;
}
