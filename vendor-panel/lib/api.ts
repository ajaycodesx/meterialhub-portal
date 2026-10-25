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

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new ApiError(response.status, data.message || 'Request failed');
      }

      return data.data;
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
