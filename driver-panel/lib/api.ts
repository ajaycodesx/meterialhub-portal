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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
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

export const driverApi = {
  getFeed: (driverId?: string) =>
    apiClient.get(`/driver/feed${driverId ? `?driver_id=${driverId}` : ''}`),

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
