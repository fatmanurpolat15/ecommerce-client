import type { TFunction } from "i18next";
import { toApiError } from "./axiosInstance";
import type { ApiErrorCode } from "./axiosInstance";

const DEFAULT_MESSAGE_KEYS: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: "errorNetwork",
  SERVER_ERROR: "errorServer",
  FORBIDDEN: "errorForbidden",
};

export function apiErrorMessage(
  error: unknown,
  t: TFunction,
  overrides: Partial<Record<ApiErrorCode, string>> = {},
): string {
  const apiError = toApiError(error);

  const key = overrides[apiError.code] ?? DEFAULT_MESSAGE_KEYS[apiError.code];
  if (key) {
    return t(key);
  }

  return apiError.message || t("errorGeneric");
}
