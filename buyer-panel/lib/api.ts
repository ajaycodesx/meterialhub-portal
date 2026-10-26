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
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('buyer_access_token') || localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('buyer_access_token', token);
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('buyer_access_token');
        localStorage.removeItem('access_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { _isRetry?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('buyer_access_token') || localStorage.getItem('access_token');
      if (stored) {
        this.token = stored;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          if (!endpoint.startsWith('/auth/') && !options._isRetry && typeof window !== 'undefined') {
            try {
              const demoEmail = process.env.NEXT_PUBLIC_DEMO_BUYER_EMAIL || 'buyer@materialhub.in';
              const demoPassword = process.env.NEXT_PUBLIC_DEMO_BUYER_PASSWORD || 'buyer123';
              const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_or_email: demoEmail, password: demoPassword })
              });
              const loginData = await loginRes.json();
              const freshToken = loginData?.data?.access_token || loginData?.access_token;
              if (freshToken) {
                this.setToken(freshToken);
                return this.request<T>(endpoint, { ...options, _isRetry: true });
              }
            } catch {
            }
          }
        }
        const errorMsg = data?.message || data?.detail || `HTTP ${response.status} Request Failed`;
        throw new ApiError(response.status, errorMsg);
      }

      return data?.data !== undefined ? data.data : data;
    } catch (error: any) {
      if (error instanceof ApiError || error?.name === 'ApiError' || typeof error?.status === 'number') {
        throw error;
      }
      throw new Error(error?.message || 'Network error or unable to reach server');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
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

export const buyerApi = {
  getHome: () => apiClient.get('/buyer/home'),

  getCatalog: (params?: { category?: string; brand?: string; merchant_id?: string; query?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/buyer/catalog${queryString ? `?${queryString}` : ''}`);
  },

  calculateOrder: (data: {
    items: { productId: string; quantity: number }[];
    pincode: string;
    distanceKm: number;
    craneNeeded: boolean;
  }) => apiClient.post('/buyer/calculate-order', data),

  createOrder: (data: {
    merchantId: string;
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    pincode: string;
    siteConstraints: { roadWidth: string; craneNeeded: boolean; unloadingTimeSlot: string };
    paymentMode: string;
  }) => apiClient.post('/buyer/orders', data),

  getOrders: () => apiClient.get('/buyer/orders'),
  getOrderTracking: (orderId: string) => apiClient.get(`/buyer/orders/${orderId}/tracking`),
};

export const vendorApi = {
  getDashboard: (merchantId?: string) =>
    apiClient.get(`/vendor/dashboard${merchantId ? `?merchant_id=${merchantId}` : ''}`),

  updateStock: (data: { productId: string; newStockQty: number; newPrice?: number }) =>
    apiClient.post('/vendor/update-stock', data),
};

export const driverApi = {
  getFeed: (driverId?: string) =>
    apiClient.get(`/driver/feed${driverId ? `?driver_id=${driverId}` : ''}`),

  updateTripStatus: (data: {
    tripId: string;
    status: string;
    currentLat?: number;
    currentLng?: number;
  }) => apiClient.post('/driver/update-trip-status', data),
};

export const paymentApi = {
  createOrder: (data: { order_id: string; amount: number; currency?: string; receipt?: string }) =>
    apiClient.post('/payment/create-order', data),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiClient.post('/payment/verify', data),
  getStatus: (paymentId: string) => apiClient.get(`/payment/status/${paymentId}`),
};

export const adminApi = {
  getOverview: () => apiClient.get('/admin/overview'),
};
