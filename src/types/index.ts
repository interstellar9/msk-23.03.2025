export type UserRole = 'mieszkaniec' | 'przedsiebiorca';
export type ListingStatus = 'active' | 'inactive' | 'expired';
export type SortOrder = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'most_liked';
export type NotificationType = 'message' | 'like' | 'system';
export type PaymentMethodType = 'card' | 'blik';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type MSKTransactionType = 'reward' | 'transfer';

export interface User {
  id: string;
  email: string;
  user_type: UserRole;
  full_name: string;
  created_at: string;
  karta_lodzianina?: string;
  nip?: string;
  company_address?: any;
  industry?: string;
  avatar_url?: string;
  contact_email?: string;
  phone?: string;
  bank_account?: string;
  contact_person?: string;
  company_description?: string;
  unread_notifications_count?: number;
  msk_balance: number;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  card_last4?: string;
  card_brand?: string;
  created_at: string;
  is_default: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  listing_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method_id?: string;
  created_at: string;
  completed_at?: string;
  transaction_ref?: string;
}

export interface MSKTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: MSKTransactionType;
  payment_id?: string;
  created_at: string;
  description: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: ListingStatus;
  likes_count: number;
  is_liked?: boolean;
  users?: {
    full_name: string;
    contact_email?: string;
    phone?: string;
    company_description?: string;
    industry?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  listing_id?: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender?: {
    full_name: string;
  };
  recipient?: {
    full_name: string;
  };
}

export interface ListingFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  search?: string;
  sortBy?: SortOrder;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  created_at: string;
  read_at?: string;
  related_user?: {
    full_name: string;
  };
}

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  created_at: string;
}