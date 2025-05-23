import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  withCredentials: true, // Always send cookies for refresh tokens
  timeout: 10000,
});

// Token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          const token = localStorage.getItem('accessToken');
          if (token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token - refresh token will be sent automatically via cookies
        const response = await axiosInstance.post('/auth/refresh-token');

        if (response.data.status === 'success') {
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);

          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Remove tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:logout'));

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle forbidden access
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: { message: error.response.data?.message || 'Access denied' }
      }));
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Authentication
  login: (credentials: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', credentials),

  register: (data: { username: string; email: string; password: string; role?: string }) =>
    axiosInstance.post('/auth/register', data),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  logoutAll: () =>
    axiosInstance.post('/auth/logout-all'),

  refreshToken: () =>
    axiosInstance.post('/auth/refresh-token'),

  // Password management
  forgotPassword: (email: string) =>
    axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    axiosInstance.patch(`/auth/reset-password/${token}`, { password }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.patch('/auth/change-password', data),

  // Email verification
  verifyEmail: (token: string) =>
    axiosInstance.get(`/auth/verify-email/${token}`),

  resendVerification: () =>
    axiosInstance.post('/auth/resend-verification'),

  // Profile management
  getProfile: () =>
    axiosInstance.get('/auth/profile'),

  updateProfile: (data: { username?: string }) =>
    axiosInstance.patch('/auth/profile', data),

  // User management (Admin)
  getUsers: () =>
    axiosInstance.get('/auth/users'),

  createUser: (data: { username: string; email: string; password: string; role: string }) =>
    axiosInstance.post('/auth/create-user', data),

  deleteUser: (id: string) =>
    axiosInstance.delete(`/auth/users/${id}`),

  // Login history and sessions
  getLoginHistory: () =>
    axiosInstance.get('/auth/login-history'),

  getSessions: () =>
    axiosInstance.get('/auth/sessions'),

  deleteSession: (sessionId: string) =>
    axiosInstance.delete(`/auth/sessions/${sessionId}`),
};

export default axiosInstance;