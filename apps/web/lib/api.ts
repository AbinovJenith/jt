import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from NextAuth session
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Normalise error responses
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Unknown error';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

export default api;

// ── Typed helpers ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
