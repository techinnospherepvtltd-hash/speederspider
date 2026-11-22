import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_SERVICES, INITIAL_PROJECTS, INITIAL_TESTIMONIALS, INITIAL_INVENTORY, INITIAL_CATEGORIES } from '@/lib/data/mock-data';
import {
  ServiceItem,
  PortfolioProject,
  TestimonialItem,
  InventoryItem,
  InventoryCategory,
  InventoryTransaction,
  ContactMessage,
  EnquiryStatus,
  SiteSetting,
} from '@/types';

// In-memory runtime store for dynamic mutations during development if Supabase keys not set
let memoryServices: ServiceItem[] = [...INITIAL_SERVICES];
let memoryProjects: PortfolioProject[] = [...INITIAL_PROJECTS];
let memoryTestimonials: TestimonialItem[] = [...INITIAL_TESTIMONIALS];
let memoryInventory: InventoryItem[] = [...INITIAL_INVENTORY];
let memoryCategories: InventoryCategory[] = [...INITIAL_CATEGORIES];
let memoryTransactions: InventoryTransaction[] = [];
let memoryEnquiries: ContactMessage[] = [];
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

export async function getAllProjectsAdmin(): Promise<PortfolioProject[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, service:services(*)')
      .order('display_order', { ascending: true });
    if (!error && data) return data as PortfolioProject[];
  }
  return memoryProjects.sort((a, b) => a.display_order - b.display_order);
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

export async function createProject(project: Omit<PortfolioProject, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioProject> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const newProject: PortfolioProject = {
    ...project,
    id: 'proj-' + Math.random().toString(36).substring(2, 9),
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert(project)
      .select()
      .single();
    if (!error && data) return data as PortfolioProject;
  }

  memoryProjects.unshift(newProject);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as PortfolioProject;
  }
  const index = memoryProjects.findIndex(p => p.id === id);
  if (index !== -1) {
    memoryProjects[index] = { ...memoryProjects[index], ...updates, updated_at: new Date().toISOString() };
    return memoryProjects[index];
  }
  return null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);
    if (!error) return true;
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
// INVENTORY REPOSITORY (MANUAL CONTROL - NO AUTO SEEDING)
// ==========================================
export async function getInventoryCategories(): Promise<InventoryCategory[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name_en', { ascending: true });
    if (!error && data && data.length > 0) return data as InventoryCategory[];
  }
  return memoryCategories;
}

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
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const newItem: InventoryItem = {
    ...item,
    id: 'inv-' + Math.random().toString(36).substring(2, 9),
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();
    if (!error && data) return data as InventoryItem;
  }

  memoryInventory.unshift(newItem);
  return newItem;
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as InventoryItem;
  }
  const index = memoryInventory.findIndex(i => i.id === id);
  if (index !== -1) {
    memoryInventory[index] = { ...memoryInventory[index], ...updates, updated_at: new Date().toISOString() };
    return memoryInventory[index];
  }
  return null;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    if (!error) return true;
  }
  const index = memoryInventory.findIndex(i => i.id === id);
  if (index !== -1) {
    memoryInventory.splice(index, 1);
    return true;
  }
  return false;
}

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  const supabase = await createServerSupabaseClient();
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

  const now = new Date().toISOString();
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

  // If Supabase is available, sync to database
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('inventory_items').update({ quantity: newQty, updated_at: now }).eq('id', itemId);
      await supabase.from('inventory_transactions').insert({
        item_id: itemId,
        transaction_type: type,
        quantity_changed: qtyDelta,
        resulting_quantity: newQty,
        reason,
        created_at: now,
      });
    } catch (e) {
      console.error('Supabase inventory sync error:', e);
    }
  }

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

// ==========================================
// SITE SETTINGS REPOSITORY (GOOGLE REVIEWS & CONFIG)
// ==========================================
export async function getGoogleReviewSettings(): Promise<{ url: string; is_enabled: boolean; label_en: string; label_ar: string }> {
  const supabase = await createServerSupabaseClient();
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

  const supabase = await createServerSupabaseClient();
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
