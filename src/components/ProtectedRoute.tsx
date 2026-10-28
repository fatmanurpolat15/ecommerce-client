import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/api";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <span
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/10 border-t-blue-500"
        aria-hidden="true"
      />
      <p role="status" className="text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      toast.error(t("errorForbidden"));
      navigate("/products");
    }
  }, [allowedRoles, user, t, navigate]);

  if (loading) {
    return <FullScreenLoader label={t("loading")} />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}