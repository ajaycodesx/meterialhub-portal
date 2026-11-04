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
      this.token = localStorage.getItem('driver_access_token') || localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('driver_access_token', token);
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('driver_access_token');
        localStorage.removeItem('access_token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('driver_access_token') || localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const token = this.getToken();


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

  onboardDriver: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicle_type: string;
    driver_license: string;
    vehicle_reg_number?: string;
  }) => apiClient.post('/auth/onboard/driver', data),

  getProfile: () => apiClient.get('/auth/me'),
};

export const driverApi = {
  getFeed: (driverId?: string) =>
    apiClient.get<any>(`/driver/feed${driverId ? `?driver_id=${driverId}` : ''}`),

  getProfile: () => apiClient.get<any>('/driver/profile'),

  updateProfile: (data: any) => apiClient.put<any>('/driver/profile', data),

  toggleOnline: () => apiClient.post<any>('/driver/toggle-online'),

  getTripHistory: () => apiClient.get<any[]>('/driver/trips/history'),

  reportException: (data: { tripId: string; exceptionType: string; description: string; photoEvidenceUrl?: string }) =>
    apiClient.post<any>('/driver/trips/exception', data),

  updateLocation: (data: {
    tripId?: string;
    latitude: number;
    longitude: number;
    speedKmh?: number | null;
    heading?: number | null;
  }) => apiClient.post<any>('/driver/location', data),


  getOffers: () => apiClient.get<any[]>('/driver/offers'),

  acceptOffer: (offerId: string) => apiClient.post<any>(`/driver/offers/${offerId}/accept`, {}),

  declineOffer: (offerId: string) => apiClient.post<any>(`/driver/offers/${offerId}/decline`, {}),

  updateTripStatus: (data: {
    tripId: string;
    status: string;
    currentLat?: number;
    currentLng?: number;
  }) => apiClient.post('/driver/update-trip-status', data),

  requestDeliveryOtp: (tripId: string) =>
    apiClient.post('/driver/request-delivery-otp', { tripId }),

  verifyDeliveryOtp: (tripId: string, otp: string) =>
    apiClient.post('/driver/verify-delivery-otp', { tripId, otp }),
};
