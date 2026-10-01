import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  status?: number;
  message: string;
  timestamp?: string;
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const TOKEN_STORAGE_KEY = "token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    const isLoginCall = originalRequest?.url?.includes("/auth/login");

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshCall || isLoginCall) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await api.post<{ token: string }>("/auth/refresh");
      const newToken = refreshResponse.data.token;
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: newToken }));
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event("auth:session-expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function toApiError(
  error: unknown,
  fallback = "An unexpected error occurred.",
): ApiError {
  if (axios.isCancel(error)) {
    return { code: "UNKNOWN_ERROR", message: "" };
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return { code: "UNKNOWN_ERROR", message: fallback };
  }

  if (!error.response) {
    return {
      code: "NETWORK_ERROR",
      message: "Could not connect to server. Please check your connection.",
    };
  }

  const { status, data } = error.response;
  const message = data?.message ?? fallback;
  const timestamp = data?.timestamp;

  switch (status) {
    case 400:
      return { code: "BAD_REQUEST", status, message, timestamp };
    case 401:
      return { code: "UNAUTHORIZED", status, message, timestamp };
    case 403:
      return { code: "FORBIDDEN", status, message, timestamp };
    case 404:
      return { code: "NOT_FOUND", status, message, timestamp };
    case 409:
      return { code: "CONFLICT", status, message, timestamp };
    case 500:
      return { code: "SERVER_ERROR", status, message, timestamp };
    default:
      return { code: "UNKNOWN_ERROR", status, message, timestamp };
  }
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  return toApiError(error, fallback).message;
}

export default api;