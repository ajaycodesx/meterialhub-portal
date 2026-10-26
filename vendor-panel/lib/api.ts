const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: any;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private isAuthenticating: boolean = false;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('vendor_access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('vendor_access_token', token);
      } else {
        localStorage.removeItem('vendor_access_token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('vendor_access_token');
    }
    return this.token;
  }

  private async ensureVendorToken(): Promise<string | null> {
    if (this.isAuthenticating) return null;
    this.isAuthenticating = true;
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_or_email: 'vendor@materialhub.in', password: 'vendor123' })
      });
      const data = await res.json().catch(() => ({}));
      const newToken = data?.data?.access_token || data?.access_token;
      if (newToken) {
        this.setToken(newToken);
        return newToken;
      }
    } catch {
      return null;
    } finally {
      this.isAuthenticating = false;
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    let token = this.getToken();

    if (!token && !endpoint.includes('/auth/login') && !isRetry) {
      token = await this.ensureVendorToken();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && !isRetry && !endpoint.includes('/auth/login')) {
          this.setToken(null);
          const newToken = await this.ensureVendorToken();
          if (newToken) {
            return this.request<T>(endpoint, options, true);
          }
        }

        const errorMsg = data?.detail || data?.message || 'Request failed';
        throw new ApiError(
          response.status,
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
        );
      }

      return data.data !== undefined ? data.data : data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Network error or unable to reach server');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export const authApi = {
  login: (phoneOrEmail: string, password: string) =>
    apiClient.post('/auth/login', { phone_or_email: phoneOrEmail, password }),

  register: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
    apiClient.post('/auth/register', data),

  getProfile: () => apiClient.get('/auth/me'),
};

export const vendorApi = {
  getDashboard: () => apiClient.get<any>('/vendor/dashboard'),

  getProfile: () => apiClient.get<any>('/vendor/profile'),

  updateProfile: (data: any) => apiClient.put<any>('/vendor/profile', data),

  toggleOnline: () => apiClient.post<any>('/vendor/toggle-online'),

  getOrders: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/vendor/orders${qs ? `?${qs}` : ''}`);
  },

  getOrderDetail: (orderId: string) => apiClient.get<any>(`/vendor/orders/${orderId}`),

  packOrder: (orderId: string) => apiClient.post<any>(`/vendor/orders/${orderId}/pack`),

  rejectOrder: (orderId: string, reason: string) =>
    apiClient.post<any>(`/vendor/orders/${orderId}/reject`, { orderId, status: 'cancelled', reason }),

  getProducts: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/vendor/products${qs ? `?${qs}` : ''}`);
  },

  createProduct: (data: any) => apiClient.post<any>('/vendor/products', data),

  updateProduct: (productId: string, data: any) => apiClient.put<any>(`/vendor/products/${productId}`, data),

  deleteProduct: (productId: string) => apiClient.delete<any>(`/vendor/products/${productId}`),

  adjustStock: (productId: string, adjustmentQty: number, reason: string) =>
    apiClient.post<any>(`/vendor/products/${productId}/adjust-stock`, { productId, adjustmentQty, reason }),

  updateStock: (data: { productId: string; newStockQty: number; newPrice?: number }) =>
    apiClient.post('/vendor/update-stock', data),

  updateOrderStatus: (data: { orderId: string; status: string }) =>
    apiClient.post('/vendor/update-order-status', data),

  getBoqQuotes: () => apiClient.get<any[]>('/vendor/boq-quotes'),

  submitBoqQuote: (quoteId: string, estimatedTotal: number, notes?: string) =>
    apiClient.post<any>(`/vendor/boq-quotes/${quoteId}/quote`, { quoteId, estimatedTotal, notes }),

  getCommodityRates: () => apiClient.get<any[]>('/vendor/commodity-rates'),

  getDeals: () => apiClient.get<any[]>('/vendor/deals'),

  proposeDeal: (data: any) => apiClient.post<any>('/vendor/deals/propose', data),

  getSettlements: () => apiClient.get<any>('/vendor/settlements'),
};
