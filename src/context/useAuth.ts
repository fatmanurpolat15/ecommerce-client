import { useContext } from "react";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "./authContextValue";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export type { AuthContextValue } from "./authContextValue";