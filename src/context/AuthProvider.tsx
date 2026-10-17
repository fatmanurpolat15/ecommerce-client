import { useCallback, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api, { TOKEN_STORAGE_KEY } from "../api/axiosInstance";
import { AuthContext } from "./authContextValue";
import type { User } from "../types/api";

export function AuthProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    function handleTokenRefreshed(event: Event) {
      const newToken = (event as CustomEvent<string>).detail;
      setToken(newToken);
    }

    function handleSessionExpired() {
      logout();
      setLoading(false);
      toast.error(t("sessionExpired"));
    }

    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [t, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{
      id: number;
      token: string;
      email: string;
      name: string;
      role: User["role"];
    }>("/auth/login", { email, password });

    const { id, token: newToken, email: userEmail, name, role } = response.data;

    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setUser({ id, email: userEmail, name, role });
    setToken(newToken);
    setLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await api.post("/auth/register", { email, password, name });
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    api
      .get<User>("/auth/me")
      .then((response) => {
        if (active) setUser(response.data);
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout, isAdmin: user?.role === "ADMIN" }}
    >
      {children}
    </AuthContext.Provider>
  );
}
