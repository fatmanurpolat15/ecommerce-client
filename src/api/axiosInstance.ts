import axios from "axios";

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

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(undefined);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = "An unexpected error occurred.") {
  return toApiError(error, fallback).message;
}

export function toApiError(error: unknown, fallback = "An unexpected error occurred."): ApiError {
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

export default api;