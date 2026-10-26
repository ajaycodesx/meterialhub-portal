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
      this.token = localStorage.getItem('admin_access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_access_token', token);
      } else {
        localStorage.removeItem('admin_access_token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('admin_access_token');
    }
    return this.token;
  }

  private async ensureAdminToken(): Promise<string | null> {
    if (this.isAuthenticating) return null;
    this.isAuthenticating = true;
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_or_email: 'admin@materialhub.in', password: 'admin123' })
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
      token = await this.ensureAdminToken();
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
          const newToken = await this.ensureAdminToken();
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

export const adminApi = {
  getOverview: () => apiClient.get<any>('/admin/overview'),
  
  getOrders: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  getOrderDetail: (orderId: string) => apiClient.get<any>(`/admin/orders/${orderId}`),

  updateOrderStatus: (orderId: string, status: string, reason?: string) =>
    apiClient.post(`/admin/orders/${orderId}/status`, { status, reason }),

  reassignDriver: (orderId: string, driverId: string, reason?: string) =>
    apiClient.post(`/admin/orders/${orderId}/reassign-driver`, { driverId, reason }),

  getMerchants: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/merchants${qs ? `?${qs}` : ''}`);
  },

  getMerchantDetail: (merchantId: string) => apiClient.get<any>(`/admin/merchants/${merchantId}`),

  verifyMerchant: (merchantId: string, verified: boolean, isOnline: boolean = true, reason?: string) =>
    apiClient.post('/admin/merchants/verify', { merchantId, verified, is_online: isOnline, reason }),

  updateMerchant: (merchantId: string, data: any) =>
    apiClient.post(`/admin/merchants/${merchantId}/update`, data),

  toggleMerchant: (data: { merchantId: string; field?: string }) =>
    apiClient.post('/admin/merchants/toggle', data),

  getProducts: (params?: { category?: string; brand?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/products${qs ? `?${qs}` : ''}`);
  },

  createProduct: (data: any) => apiClient.post('/admin/products', data),

  updateProduct: (productId: string, data: any) => apiClient.put(`/admin/products/${productId}`, data),

  deleteProduct: (productId: string) => apiClient.delete(`/admin/products/${productId}`),

  getCategories: () => apiClient.get<any[]>('/admin/categories'),

  saveCategory: (data: any) => apiClient.post('/admin/categories', data),

  getBuyers: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/buyers${qs ? `?${qs}` : ''}`);
  },

  toggleUserStatus: (userId: string, field: string = 'is_active') =>
    apiClient.post('/admin/users/toggle', { userId, field }),

  getDrivers: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/drivers${qs ? `?${qs}` : ''}`);
  },

  getTrips: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/trips${qs ? `?${qs}` : ''}`);
  },

  updateTripStatus: (tripId: string, status: string) =>
    apiClient.post('/admin/trips/status', { tripId, status }),

  getPayments: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/payments${qs ? `?${qs}` : ''}`);
  },

  processRefund: (orderId: string, amount: number | null, reason: string) =>
    apiClient.post('/admin/payments/refund', { orderId, amount, reason }),

  getBoqQuotes: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiClient.get<any>(`/admin/boq-quotes${qs ? `?${qs}` : ''}`);
  },

  updateBoqQuote: (quoteId: string, status: string, estimatedTotal?: number) =>
    apiClient.post(`/admin/boq-quotes/${quoteId}/status`, { status, estimated_total: estimatedTotal }),

  getCommodityRates: () => apiClient.get<any[]>('/admin/commodity-rates'),

  updateCommodityRate: (data: { id: string; wholesale_rate: number; trend?: string; change_percent?: number }) =>
    apiClient.post('/admin/commodity-rates', data),

  getDeals: () => apiClient.get<any[]>('/admin/deals'),

  saveDeal: (data: any) => apiClient.post('/admin/deals', data),

  deleteDeal: (dealId: string) => apiClient.delete(`/admin/deals/${dealId}`),

  getDisputes: () => apiClient.get<any[]>('/admin/disputes'),

  updateDispute: (disputeId: string, status: string, resolutionNotes: string) =>
    apiClient.post(`/admin/disputes/${disputeId}`, { status, resolutionNotes }),

  getTemplates: () => apiClient.get<any[]>('/admin/templates'),

  updateTemplate: (templateId: string, bodyText: string, subject?: string, isActive: boolean = true) =>
    apiClient.post(`/admin/templates/${templateId}`, { templateId, subject, bodyText, isActive }),

  getSettings: () => apiClient.get<any>('/admin/settings'),

  updateSettings: (data: any) => apiClient.post('/admin/settings', data),

  getAuditLogs: (limit: number = 50) => apiClient.get<any[]>(`/admin/audit-logs?limit=${limit}`),
};
