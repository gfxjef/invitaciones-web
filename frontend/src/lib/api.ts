/**
 * API Client Configuration
 * 
 * WHY: Centralized API client with axios for consistent HTTP requests
 * across the frontend. Includes request/response interceptors for
 * authentication and error handling.
 * 
 * WHAT: Configured axios instance with base URL, interceptors, and
 * typed response interfaces for the invitations API.
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { InvitationMedia, InvitationEvent } from '@/types/invitation';

// Re-export types for component usage
export type { InvitationEvent, InvitationMedia } from '@/types/invitation';

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth store reference (will be set up after store is created)
let authStoreRef: any = null;

/**
 * Set auth store reference for interceptors
 * This is called after the auth store is initialized
 */
export const setAuthStoreRef = (store: any) => {
  authStoreRef = store;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding auth header for refresh endpoint
    if (config.url === '/auth/refresh') {
      return config;
    }
    
    // Try to get token from auth store first, fallback to localStorage
    let token: string | null = null;
    
    if (authStoreRef) {
      token = authStoreRef.getState().accessToken;
    } else if (typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 [API] Adding auth header to request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
      });
    } else {
      console.warn('⚠️ [API] No auth token available for request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        authStoreRef: !!authStoreRef,
        localStorage: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ [API] Response received:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ [API] Response error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    const originalRequest = error.config as any;

    // Handle 500 internal server errors with retry (development mode only)
    if (error.response?.status === 500 && process.env.NODE_ENV === 'development') {
      // Initialize retry count
      originalRequest._retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;
      const retryDelay = Math.min(100 * Math.pow(2, originalRequest._retryCount), 2000); // Exponential backoff: 100ms, 200ms, 400ms, max 2s

      if (originalRequest._retryCount < maxRetries) {
        originalRequest._retryCount += 1;

        console.warn(`🔄 [API] Retrying request (attempt ${originalRequest._retryCount}/${maxRetries}) after ${retryDelay}ms:`, {
          url: originalRequest.url,
          method: originalRequest.method?.toUpperCase(),
          error: error.message
        });

        // Wait for exponential backoff delay, then retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return apiClient(originalRequest);
      } else {
        console.error(`❌ [API] Max retries (${maxRetries}) exceeded for:`, {
          url: originalRequest.url,
          method: originalRequest.method?.toUpperCase(),
          finalError: error.message
        });
      }
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token if auth store is available
      if (authStoreRef) {
        const authState = authStoreRef.getState();
        
        if (authState.refreshToken && !authState.isRefreshing) {
          try {
            const success = await authState.refreshTokens();
            
            if (success) {
              // Retry original request with new token
              const newToken = authStoreRef.getState().accessToken;
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // If refresh failed or no refresh token, logout
        authState.logout(true);
      } else {
        // Fallback: clear localStorage and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Template types
export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  preview_image_url: string;
  thumbnail_url: string;
  is_premium: boolean;
  is_active: boolean;
  display_order: number;
  supported_features: string[];
  default_colors: Record<string, string>;
  // TODO: Test these properties - remove comments if system works correctly
  template_file?: string; // Key for template registry (required by TemplateRenderer)
  template_type?: string; // Template type (modular, legacy, etc.)
  sections_config?: Record<string, any>;
  sections_config_ordered?: string[];
  featured?: boolean; // Template featured status (for TemplateSelector)
  plan_id?: number;
  plan?: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
  price?: number;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplatesResponse {
  templates: Template[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Cart types - Updated to match backend cart API
export interface CartItem {
  type: 'template' | 'plan';
  id: number;
  name: string;
  description: string;
  category?: string;
  preview_image_url?: string;
  thumbnail_url?: string;
  is_premium?: boolean;
  plan_id?: number;
  quantity: number;
  price?: number; // For both plans and templates (from backend)
}

export interface Cart {
  id?: number;
  items: CartItem[];
  total_amount: number;
  item_count: number;
}

// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified?: boolean;
  created_at: string;
  updated_at?: string;
  // Optional fields for profile form (may not be in backend yet)
  address?: string;
  birth_date?: string;
  bio?: string;
  avatar_url?: string;
  two_factor_enabled?: boolean;
  last_login?: string;
  preferences?: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    marketing_emails?: boolean;
    order_updates?: boolean;
    invitation_reminders?: boolean;
    guest_responses?: boolean;
  };
  stats?: {
    total_orders?: number;
    total_invitations?: number;
    member_since?: string;
  };
}

// Order types
export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  total_amount?: number; // For backward compatibility
  subtotal: number;
  discount_amount: number;
  currency: string;
  coupon_code?: string;
  items: OrderItem[];
  created_at: string;
  paid_at?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

// API Methods - Templates
export const templatesApi = {
  /**
   * Get paginated list of templates with optional filtering
   */
  getTemplates: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    is_premium?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<TemplatesResponse> => {
    const response = await apiClient.get('/templates', { params });
    return response.data;
  },

  /**
   * Get single template by ID
   */
  getTemplate: async (id: number): Promise<{ template: Template }> => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  /**
   * Get template categories for filtering
   */
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/templates?per_page=1000');
    const categories = new Set(response.data.templates.map((t: Template) => t.category).filter(Boolean));
    return Array.from(categories) as string[];
  },
};

// API Methods - Cart
export const cartApi = {
  /**
   * Get current user's cart
   */
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart/items');
    const cart = response.data.cart || [];
    const summary = response.data.summary || { total_items: 0, total_price: 0 };
    
    return {
      id: 1, // Not used in new backend
      items: cart,
      item_count: summary.total_items,
      total_amount: summary.total_price,
    };
  },

  /**
   * Add template to cart (single template selection)
   */
  addToCart: async (templateId: number, quantity: number = 1): Promise<Cart> => {
    const response = await apiClient.post('/cart/items', {
      type: 'template',
      id: templateId,
      quantity: 1, // Templates always have quantity 1
    });
    const cart = response.data.cart || [];
    
    return {
      id: 1,
      items: cart,
      item_count: cart.length,
      total_amount: cart.reduce((sum: number, item: CartItem) => sum + (item.price || 0) * item.quantity, 0),
    };
  },

  /**
   * Update cart item quantity (not applicable for templates)
   */
  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    // For templates, this would just replace the selection
    const response = await apiClient.post('/cart/items', {
      type: 'template', 
      id: itemId,
      quantity: 1,
    });
    return response.data.cart || { id: 0, items: [], total_amount: 0, item_count: 0 };
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}?type=template`);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    await apiClient.post('/cart/clear');
  },
};

// Payment types
export interface PaymentToken {
  token: string;
  transaction_id: string;
  order_number: string;
  config: {
    merchant_code: string;
    public_key: string;
    mode: string;
    amount: string;
    currency: string;
  };
}

export interface CreatePaymentTokenRequest {
  order_id: number;
  billing_info: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    document: string;
    documentType: string;
  };
}

export interface ProcessPaymentRequest {
  order_id: number;
  payment_result: {
    status: string;
    transaction_id: string;
    izipay_data: any;
  };
}

// API Methods - Payments
export const paymentsApi = {
  /**
   * Create formToken for Izipay checkout (según documentación oficial)
   */
  createPaymentToken: async (data: CreatePaymentTokenRequest): Promise<{success: boolean; formToken: string; publicKey: string; order_number: string}> => {
    const response = await apiClient.post('/payments/formtoken', data);
    return response.data;
  },

  /**
   * Process payment result from Izipay
   */
  processPayment: async (data: ProcessPaymentRequest): Promise<{success: boolean; order_status: string; message: string}> => {
    const response = await apiClient.post('/payments/process-payment', data);
    return response.data;
  },

  /**
   * Get payment status for order
   */
  getPaymentStatus: async (orderId: number): Promise<{success: boolean; order_id: number; status: string; total: number}> => {
    const response = await apiClient.get(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * Get payment configuration
   */
  getPaymentConfig: async (): Promise<{merchant_code: string; public_key: string; mode: string}> => {
    const response = await apiClient.get('/payments/config');
    return response.data;
  },
};

// API Methods - Orders
export const ordersApi = {
  /**
   * Create new order from current cart
   */
  createOrder: async (orderData: {
    billing_address: any;
    coupon_code?: string;
  }): Promise<{success: boolean; order: Order}> => {
    // WHY: Now backend properly handles billing_address data
    const response = await apiClient.post('/orders/', orderData);
    return response.data;
  },

  /**
   * Get user's orders
   */
  getOrders: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/orders/', { params });
    return response.data;
  },

  /**
   * Get single order by ID
   */
  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order;
  },

  /**
   * Get single order by order number
   */
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/number/${orderNumber}`);
    return response.data.order;
  },
};

// Invitation types
export interface Invitation {
  id: number;
  name: string;
  event_type: 'boda' | 'quince' | 'bautizo' | 'cumpleanos' | 'baby_shower' | 'otro';
  event_date: string;
  url_slug: string;
  full_url: string;
  status: 'draft' | 'active' | 'expired' | 'completed';
  template_name: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  stats: {
    total_views: number;
    unique_visitors: number;
    rsvp_responses: number;
    rsvp_confirmed: number;
    rsvp_declined: number;
    shares: number;
  };
  settings: {
    rsvp_enabled: boolean;
    rsvp_deadline?: string;
    guest_limit?: number;
    is_public: boolean;
    password_protected: boolean;
  };
}

// Dashboard stats types
export interface DashboardStats {
  user: {
    total_orders: number;
    total_spent: number;
    member_since: string;
    favorite_templates: number;
  };
  invitations: {
    total_invitations: number;
    active_invitations: number;
    total_views: number;
    total_confirmations: number;
  };
  recent_activity: {
    orders: Order[];
    invitations: Invitation[];
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface GoogleOAuthRequest {
  credential: string;
}

export interface GoogleOAuthResponse {
  access_token: string;
  refresh_token: string;
  user: User & {
    provider: string;
    google_id?: string;
    profile_picture?: string;
  };
  expires_in: number;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  invitation_reminders: boolean;
  guest_responses: boolean;
}

// API Methods - Auth
export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<ApiResponse<{ message: string }>> => {
    // Ensure only the required fields are sent to backend
    const { email, password, first_name, last_name, phone } = userData;
    const registerData = {
      email,
      password,
      first_name,
      last_name,
      ...(phone && { phone }) // Only include phone if it's provided and not empty
    };
    
    const response = await apiClient.post('/auth/register', registerData);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshData: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh', refreshData);
    return response.data;
  },

  /**
   * Get current user profile (requires auth)
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put('/auth/password', passwordData);
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await apiClient.put('/auth/notifications', preferences);
    return response.data;
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/auth/notifications');
    return response.data;
  },

  /**
   * Verify Google OAuth credential and get JWT tokens
   */
  verifyGoogleToken: async (data: GoogleOAuthRequest): Promise<GoogleOAuthResponse> => {
    const response = await apiClient.post('/auth/google/verify', data);
    return response.data;
  },

  /**
   * Get Google OAuth login status
   */
  getGoogleAuthStatus: async (): Promise<{
    connected: boolean;
    google_email?: string;
    connected_at?: string;
  }> => {
    const response = await apiClient.get('/auth/google/status');
    return response.data;
  },

  /**
   * Revoke Google OAuth connection
   */
  revokeGoogleAuth: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/google/revoke');
    return response.data;
  },
};

// API Methods - Invitations
export const invitationsApi = {
  /**
   * Get user's invitations
   */
  getInvitations: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    event_type?: string;
  }): Promise<PaginatedResponse<Invitation>> => {
    const response = await apiClient.get('/invitations', { params });
    return response.data;
  },

  /**
   * Get single invitation by ID
   */
  getInvitation: async (id: number): Promise<Invitation> => {
    const response = await apiClient.get(`/invitations/${id}`);
    return response.data;
  },

  /**
   * Create new invitation
   */
  createInvitation: async (invitationData: {
    name: string;
    event_type: string;
    event_date: string;
    template_id: number;
  }): Promise<Invitation> => {
    const response = await apiClient.post('/invitations', invitationData);
    return response.data;
  },

  /**
   * Update invitation
   */
  updateInvitation: async (id: number, invitationData: Partial<Invitation>): Promise<Invitation> => {
    const response = await apiClient.put(`/invitations/${id}`, invitationData);
    return response.data;
  },

  /**
   * Delete invitation
   */
  deleteInvitation: async (id: number): Promise<void> => {
    await apiClient.delete(`/invitations/${id}`);
  },

  /**
   * Get invitation statistics
   */
  getInvitationStats: async (id: number): Promise<Invitation['stats']> => {
    const response = await apiClient.get(`/invitations/${id}/stats`);
    return response.data;
  },

  /**
   * Update invitation settings
   */
  updateInvitationSettings: async (id: number, settings: Invitation['settings']): Promise<Invitation['settings']> => {
    const response = await apiClient.put(`/invitations/${id}/settings`, settings);
    return response.data;
  },
};

// Coupon types
export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  usage_count: number;
  min_order_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponRequest {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  min_order_amount?: number;
  is_active?: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface CouponValidation {
  valid: boolean;
  message: string;
  discount_amount?: number;
  coupon?: Coupon;
}

export interface ApplyCouponRequest {
  coupon_code: string;
  order_amount: number;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  discount_amount: number;
  final_amount: number;
  coupon: Coupon;
}

// API Methods - Coupons
export const couponsApi = {
  /**
   * Get all coupons (admin only)
   */
  getCoupons: async (params?: {
    page?: number;
    per_page?: number;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get('/coupons', { params });
    return response.data;
  },

  /**
   * Get single coupon by ID (admin only)
   */
  getCoupon: async (id: number): Promise<Coupon> => {
    const response = await apiClient.get(`/coupons/${id}`);
    return response.data;
  },

  /**
   * Create new coupon (admin only)
   */
  createCoupon: async (couponData: CreateCouponRequest): Promise<Coupon> => {
    const response = await apiClient.post('/coupons', couponData);
    return response.data;
  },

  /**
   * Update existing coupon (admin only)
   */
  updateCoupon: async (id: number, couponData: UpdateCouponRequest): Promise<Coupon> => {
    const response = await apiClient.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  /**
   * Delete coupon (admin only)
   */
  deleteCoupon: async (id: number): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (code: string, orderAmount?: number): Promise<CouponValidation> => {
    const response = await apiClient.post('/coupons/validate', {
      code,
      order_amount: orderAmount,
    });
    return response.data;
  },

  /**
   * Get public coupon info by code
   */
  getPublicCoupon: async (code: string): Promise<{
    code: string;
    type: string;
    value: number;
    min_order_amount: number;
  }> => {
    const response = await apiClient.get(`/coupons/public/${code}`);
    return response.data;
  },

  /**
   * Apply coupon to order
   */
  applyCoupon: async (data: ApplyCouponRequest): Promise<ApplyCouponResponse> => {
    const response = await apiClient.post('/coupons/apply', data);
    return response.data;
  },

  /**
   * Remove applied coupon
   */
  removeCoupon: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/coupons/remove');
    return response.data;
  },
};

// Invitation URL types
export interface InvitationURL {
  id: number;
  invitation_id: number;
  user_id: number;
  short_code: string;
  original_url: string;
  title: string;
  is_active: boolean;
  visit_count: number;
  last_visited_at: string | null;
  created_at: string;
  qr_code_path: string;
}

export interface VisitStats {
  total_visits: number;
  unique_visits: number;
  daily_visits: Array<{
    date: string;
    visits: number;
  }>;
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  browsers: {
    [key: string]: number;
  };
  countries: {
    [key: string]: number;
  };
}

export interface CreateInvitationURLRequest {
  invitation_id: number;
  original_url: string;
  title: string;
}

export interface UpdateInvitationURLRequest {
  title?: string;
  is_active?: boolean;
  original_url?: string;
}

// User Plan types for validation
export interface UserPlan {
  id: number;
  name: string;
  type: 'standard' | 'exclusive';
  max_urls_per_invitation: number;
  features: string[];
}

// API Methods - Invitation URLs
export const invitationUrlsApi = {
  /**
   * Get invitation URLs for a specific invitation
   */
  getInvitationURLs: async (invitationId: number): Promise<InvitationURL[]> => {
    const response = await apiClient.get(`/invitations/${invitationId}/urls`);
    return response.data;
  },

  /**
   * Get all invitation URLs for the current user
   */
  getAllInvitationURLs: async (params?: {
    page?: number;
    per_page?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<InvitationURL>> => {
    const response = await apiClient.get('/invitation-urls', { params });
    return response.data;
  },

  /**
   * Get single invitation URL by ID
   */
  getInvitationURL: async (id: number): Promise<InvitationURL> => {
    const response = await apiClient.get(`/invitation-urls/${id}`);
    return response.data;
  },

  /**
   * Create new invitation URL
   */
  createInvitationURL: async (urlData: CreateInvitationURLRequest): Promise<InvitationURL> => {
    const response = await apiClient.post('/invitation-urls', urlData);
    return response.data;
  },

  /**
   * Update invitation URL
   */
  updateInvitationURL: async (id: number, urlData: UpdateInvitationURLRequest): Promise<InvitationURL> => {
    const response = await apiClient.put(`/invitation-urls/${id}`, urlData);
    return response.data;
  },

  /**
   * Delete invitation URL
   */
  deleteInvitationURL: async (id: number): Promise<void> => {
    await apiClient.delete(`/invitation-urls/${id}`);
  },

  /**
   * Get visit statistics for invitation URL
   */
  getInvitationURLStats: async (id: number): Promise<VisitStats> => {
    const response = await apiClient.get(`/invitation-urls/${id}/stats`);
    return response.data;
  },

  /**
   * Get QR code for invitation URL
   */
  getQRCode: async (shortCode: string): Promise<Blob> => {
    const response = await apiClient.get(`/r/${shortCode}/qr`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Toggle URL active status
   */
  toggleURLStatus: async (id: number): Promise<InvitationURL> => {
    const response = await apiClient.patch(`/invitation-urls/${id}/toggle`);
    return response.data;
  },

  /**
   * Get public URL redirect info (for testing)
   */
  getRedirectInfo: async (shortCode: string): Promise<{
    original_url: string;
    title: string;
    is_active: boolean;
    visit_count: number;
  }> => {
    const response = await apiClient.get(`/r/${shortCode}/info`);
    return response.data;
  },

  /**
   * Get user plan information for URL limits validation
   */
  getUserPlan: async (): Promise<UserPlan> => {
    const response = await apiClient.get('/user/plan');
    return response.data;
  },
};

// Preview and Public URL types
export interface PreviewData {
  invitation: Invitation;
  custom_data: Record<string, any>;
  media: Record<string, InvitationMedia[]>;
  events: InvitationEvent[];
  preview_url: string;
  generated_at: string;
}

export interface PublicURLRequest {
  invitation_id: number;
  custom_slug?: string;
  title: string;
  description?: string;
  enable_seo?: boolean;
  enable_analytics?: boolean;
  password_protected?: boolean;
  password?: string;
}

export interface PublicURLResponse {
  success: boolean;
  public_url: string;
  full_url: string;
  seo_preview: {
    title: string;
    description: string;
    og_image: string;
    twitter_card: string;
  };
  analytics_enabled: boolean;
}

export interface URLAnalytics {
  url: string;
  total_visits: number;
  unique_visitors: number;
  daily_visits: Array<{
    date: string;
    visits: number;
    unique_visits: number;
  }>;
  referrer_stats: Record<string, number>;
  device_stats: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  location_stats: Record<string, number>;
  social_shares: Record<string, number>;
}

export interface StaticGenerationRequest {
  invitation_id: number;
  force_regenerate?: boolean;
  optimize_images?: boolean;
  include_analytics?: boolean;
}

export interface StaticGenerationResponse {
  success: boolean;
  static_url: string;
  cdn_url: string;
  assets: {
    html: string;
    css: string[];
    js: string[];
    images: string[];
  };
  cache_duration: number;
  expires_at: string;
}

// API Methods - Preview System
export const previewApi = {
  /**
   * Get invitation preview data for template rendering
   */
  getPreviewData: async (invitationId: number): Promise<PreviewData> => {
    const response = await apiClient.get(`/invitation-editor/${invitationId}/preview`);
    return response.data;
  },

  /**
   * Generate static preview for social sharing
   */
  generateStaticPreview: async (invitationId: number, options?: {
    device?: 'mobile' | 'tablet' | 'desktop';
    format?: 'png' | 'jpg' | 'webp';
    width?: number;
    height?: number;
  }): Promise<{ image_url: string; expires_at: string }> => {
    const response = await apiClient.post(`/invitation-editor/${invitationId}/preview/static`, options);
    return response.data;
  },

  /**
   * Validate invitation data for preview generation
   */
  validatePreviewData: async (invitationId: number): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    completeness: number;
  }> => {
    const response = await apiClient.get(`/invitation-editor/${invitationId}/preview/validate`);
    return response.data;
  },

  /**
   * Get preview templates and styles
   */
  getPreviewTemplates: async (): Promise<{
    templates: Record<string, any>;
    styles: Record<string, string>;
    fonts: string[];
  }> => {
    const response = await apiClient.get('/preview/templates');
    return response.data;
  },
};

// API Methods - Public URL Management
export const publicUrlApi = {
  /**
   * Generate public URL for invitation
   */
  generatePublicURL: async (data: PublicURLRequest): Promise<PublicURLResponse> => {
    const response = await apiClient.post('/public-urls/generate', data);
    return response.data;
  },

  /**
   * Check custom slug availability
   */
  checkSlugAvailability: async (slug: string, excludeInvitationId?: number): Promise<{
    available: boolean;
    message: string;
    suggestions?: string[];
  }> => {
    const response = await apiClient.get(`/public-urls/check-slug/${slug}`, {
      params: { exclude_id: excludeInvitationId }
    });
    return response.data;
  },

  /**
   * Update public URL settings
   */
  updatePublicURL: async (invitationId: number, updates: Partial<PublicURLRequest>): Promise<PublicURLResponse> => {
    const response = await apiClient.put(`/public-urls/${invitationId}`, updates);
    return response.data;
  },

  /**
   * Delete public URL (unpublish)
   */
  deletePublicURL: async (invitationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/public-urls/${invitationId}`);
    return response.data;
  },

  /**
   * Get public URL analytics
   */
  getURLAnalytics: async (invitationId: number, dateRange?: {
    start_date: string;
    end_date: string;
  }): Promise<URLAnalytics> => {
    const response = await apiClient.get(`/public-urls/${invitationId}/analytics`, {
      params: dateRange
    });
    return response.data;
  },

  /**
   * Generate QR code for public URL
   */
  generateQRCode: async (invitationId: number, options?: {
    size?: number;
    format?: 'png' | 'svg';
    error_correction?: 'L' | 'M' | 'Q' | 'H';
  }): Promise<{ qr_code_url: string; download_url: string }> => {
    const response = await apiClient.post(`/public-urls/${invitationId}/qr-code`, options);
    return response.data;
  },
};

// API Methods - Static Generation
export const staticGenerationApi = {
  /**
   * Generate static files for invitation
   */
  generateStaticFiles: async (data: StaticGenerationRequest): Promise<StaticGenerationResponse> => {
    const response = await apiClient.post('/static-generation/generate', data);
    return response.data;
  },

  /**
   * Get static file status
   */
  getStaticStatus: async (invitationId: number): Promise<{
    has_static: boolean;
    last_generated: string;
    static_url: string;
    cdn_url: string;
    expires_at: string;
  }> => {
    const response = await apiClient.get(`/static-generation/status/${invitationId}`);
    return response.data;
  },

  /**
   * Invalidate static cache
   */
  invalidateStaticCache: async (invitationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/static-generation/cache/${invitationId}`);
    return response.data;
  },

  /**
   * Upload to CDN/FTP
   */
  uploadToFTP: async (invitationId: number, files: {
    html: string;
    assets: string[];
  }): Promise<{
    success: boolean;
    ftp_url: string;
    uploaded_files: string[];
  }> => {
    const response = await apiClient.post(`/static-generation/upload/${invitationId}`, files);
    return response.data;
  },
};

// API Methods - Social Sharing
export const socialSharingApi = {
  /**
   * Generate social media preview
   */
  generateSocialPreview: async (invitationId: number, platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram'): Promise<{
    preview_url: string;
    title: string;
    description: string;
    image_url: string;
    share_url: string;
  }> => {
    const response = await apiClient.post(`/social-sharing/${invitationId}/preview`, { platform });
    return response.data;
  },

  /**
   * Track social share
   */
  trackSocialShare: async (invitationId: number, platform: string, metadata?: Record<string, any>): Promise<void> => {
    await apiClient.post(`/social-sharing/${invitationId}/track`, { platform, metadata });
  },

  /**
   * Get sharing statistics
   */
  getSharingStats: async (invitationId: number): Promise<{
    total_shares: number;
    platform_breakdown: Record<string, number>;
    conversion_rate: number;
    viral_coefficient: number;
  }> => {
    const response = await apiClient.get(`/social-sharing/${invitationId}/stats`);
    return response.data;
  },
};

// API Methods - Export and Print
export const exportApi = {
  /**
   * Export invitation as PDF using backend Playwright service
   */
  exportToPDF: async (invitationId: number, options?: {
    format?: 'A4' | 'letter' | 'A5' | 'custom';
    orientation?: 'portrait' | 'landscape';
    quality?: 'high' | 'medium' | 'low';
    include_rsvp?: boolean;
  }): Promise<{ pdf_url: string; download_url: string; expires_at: string }> => {
    // Map frontend options to backend API parameters
    const backendOptions = {
      invitation_id: invitationId,
      device_type: 'invitation_mobile', // Use optimized mobile profile
      quality: options?.quality === 'high' ? 'high' : options?.quality === 'low' ? 'draft' : 'standard',
      filename: `invitation-${invitationId}.pdf`,
      options: {
        format: options?.format || 'A4',
        orientation: options?.orientation || 'portrait',
        include_rsvp: options?.include_rsvp ?? true
      }
    };

    // Call new backend PDF service with extended timeout for PDF generation
    const response = await apiClient.post('/pdf/generate', backendOptions, {
      responseType: 'blob', // Expect PDF binary data
      timeout: 90000 // 90 seconds for PDF generation (longer than backend timeout)
    });

    // Create download URL from blob
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const download_url = URL.createObjectURL(pdfBlob);

    return {
      pdf_url: download_url,
      download_url: download_url,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  },

  /**
   * Export invitation as image
   */
  exportToImage: async (invitationId: number, options?: {
    format?: 'png' | 'jpg' | 'webp';
    width?: number;
    height?: number;
    quality?: number;
    device?: 'mobile' | 'tablet' | 'desktop';
  }): Promise<{ image_url: string; download_url: string; expires_at: string }> => {
    const response = await apiClient.post(`/export/${invitationId}/image`, options);
    return response.data;
  },

  /**
   * Get print-optimized HTML
   */
  getPrintHTML: async (invitationId: number, options?: {
    include_styles?: boolean;
    optimize_fonts?: boolean;
    high_resolution?: boolean;
  }): Promise<{ html: string; css: string; fonts: string[] }> => {
    const response = await apiClient.get(`/export/${invitationId}/print-html`, { params: options });
    return response.data;
  },
};

// API Methods - Dashboard
export const dashboardApi = {
  /**
   * Get dashboard statistics and recent activity
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get user activity summary
   */
  getUserActivity: async (params?: {
    days?: number;
    limit?: number;
  }): Promise<{
    recent_orders: Order[];
    recent_invitations: Invitation[];
    activity_summary: {
      orders_count: number;
      invitations_count: number;
      total_views: number;
      total_rsvps: number;
    };
  }> => {
    const response = await apiClient.get('/dashboard/activity', { params });
    return response.data;
  },

  /**
   * Export user data
   */
  exportUserData: async (): Promise<{ download_url: string; expires_at: string }> => {
    const response = await apiClient.post('/dashboard/export');
    return response.data;
  },
};

export default apiClient;