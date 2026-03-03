import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Send HttpOnly cookies with every request
});

// Silent refresh interceptor – retries once with /auth/refresh if 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        // Force logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
