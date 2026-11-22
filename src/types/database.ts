export type UserRole = 'owner' | 'manager' | 'staff';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: string;
  slug_en: string;
  slug_ar: string;
  title_en: string;
  title_ar: string;
  short_desc_en: string;
  short_desc_ar: string;
  description_en: string;
  description_ar: string;
  icon_name: string;
  featured_image: string;
  gallery_images: string[];
  // Dedicated Before & After visual comparison for every service
  before_image?: string | null;
  after_image?: string | null;
  before_caption_en?: string | null;
  before_caption_ar?: string | null;
  after_caption_en?: string | null;
  after_caption_ar?: string | null;
  before_alt_en?: string | null;
  before_alt_ar?: string | null;
  after_alt_en?: string | null;
  after_alt_ar?: string | null;
  seo_title_en?: string | null;
  seo_title_ar?: string | null;
  seo_desc_en?: string | null;
  seo_desc_ar?: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  service_id?: string | null;
  title_en: string;
  title_ar: string;
  short_desc_en?: string | null;
  short_desc_ar?: string | null;
  desc_en: string; // Full project description
  desc_ar: string; // Full project description
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: string | null;
  before_image: string;
  after_image: string;
  gallery_images: string[];
  video_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  seo_title_en?: string | null;
  seo_title_ar?: string | null;
  seo_desc_en?: string | null;
  seo_desc_ar?: string | null;
  created_at: string;
  updated_at: string;
  service?: ServiceItem;
}

export interface TestimonialItem {
  id: string;
  client_name_en: string;
  client_name_ar: string;
  vehicle_info?: string | null;
  rating: number;
  review_en: string;
  review_ar: string;
  avatar_url?: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface InventoryCategory {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description?: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name_en: string;
  name_ar: string;
  category_id?: string | null;
  description?: string | null;
  quantity: number;
  min_threshold: number;
  cost_price: number;
  supplier?: string | null;
  storage_location?: string | null;
  status: 'active' | 'discontinued' | 'archived';
  created_at: string;
  updated_at: string;
  category?: InventoryCategory;
}

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: TransactionType;
  quantity_changed: number;
  resulting_quantity: number;
  reason: string;
  performed_by?: string | null;
  notes?: string | null;
  created_at: string;
  item?: InventoryItem;
  performer?: Profile;
}

export type EnquiryStatus = 'new' | 'in_progress' | 'contacted' | 'completed' | 'archived';

export interface ContactMessage {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  service_id?: string | null;
  message: string;
  preferred_language: 'en' | 'ar';
  status: EnquiryStatus;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  service?: ServiceItem;
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
  user?: Profile;
}
