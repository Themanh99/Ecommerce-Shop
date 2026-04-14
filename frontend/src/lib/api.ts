/**
 * lib/api.ts
 *
 * Centralized Axios instance with:
 *  1. Cookie-based auth (withCredentials)
 *  2. Silent 401 → refresh → retry (transparent token renewal)
 *  3. Global error toast — auto-shows backend message via toast.error()
 *  4. Per-request opt-out: pass { _silent: true } in axios config
 *
 * Usage:
 *   api.get('/products')                              // shows toast on error
 *   api.post('/auth/check', data, { _silent: true })  // suppresses toast
 */
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import toast from './toast';

// Extend BOTH config types to support _silent and _retry flags
declare module 'axios' {
  interface AxiosRequestConfig {
    _silent?: boolean;
    _retry?: boolean;
  }
  interface InternalAxiosRequestConfig {
    _silent?: boolean;
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// ── Silent 401 Refresh queue ──────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

// ── Extract readable message from API error ───────────────────────────────
function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Đã xảy ra lỗi không xác định';

  const { response } = error;

  // Network / timeout — no response
  if (!response) return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';

  // Backend message (NestJS standard: { message: string | string[] })
  const rawMessage = response.data?.message;
  if (Array.isArray(rawMessage)) return rawMessage.join(' • ');
  if (typeof rawMessage === 'string' && rawMessage.trim()) return rawMessage;

  // Fallback by status code
  switch (response.status) {
    case 400: return 'Dữ liệu không hợp lệ.';
    case 401: return 'Phiên đăng nhập đã hết hạn.';
    case 403: return 'Bạn không có quyền thực hiện thao tác này.';
    case 404: return 'Không tìm thấy tài nguyên.';
    case 409: return 'Dữ liệu đã tồn tại.';
    case 422: return 'Dữ liệu không hợp lệ.';
    case 429: return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.';
    case 500: return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    default:  return `Lỗi ${response.status}`;
  }
}

// ── Response interceptors ─────────────────────────────────────────────────
api.interceptors.response.use(
  // ✅ Success — pass through unchanged
  (res) => res,

  // ❌ Error handling
  async (error) => {
    const config = error.config as InternalAxiosRequestConfig;
    const status = error.response?.status;

    // ── 401: try silent token refresh ──
    if (status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(config));
      }

      config._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh', null, { _silent: true });
        processQueue(null);
        return api(config);
      } catch (refreshErr) {
        processQueue(refreshErr);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        // Silent — user just gets redirected, no popup needed
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Show toast unless caller opts out ──
    const isSilent = config?._silent === true;
    const isRefreshRoute = config?.url?.includes('/auth/refresh');

    if (!isSilent && !isRefreshRoute) {
      const msg = getErrorMessage(error);
      toast.error(msg);
    }

    return Promise.reject(error);
  },
);

export default api;
