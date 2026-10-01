import { useCallback, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import api from "../api/axiosInstance";
import { AuthContext } from "./authContextValue";
import type { User } from "../types/api";

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem("token")));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
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
      value={{ token, user, loading, login, logout, isAdmin: user?.role === "ADMIN" }}
    >
      {children}
    </AuthContext.Provider>
  );
}