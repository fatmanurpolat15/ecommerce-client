import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth";
import { apiErrorMessage } from "../api/apiErrorMessage";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";

const DEFAULT_REDIRECT = "/products";

function resolveRedirect(state: unknown): string {
  if (state && typeof state === "object" && "from" in state) {
    const from = (state as { from?: unknown }).from;

    if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
      return from;
    }
  }

  return DEFAULT_REDIRECT;
}

function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisteredAlert, setShowRegisteredAlert] = useState<boolean>(
    () => Boolean(location.state?.registered),
  );

  if (token) {
    return <Navigate to={resolveRedirect(location.state)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowRegisteredAlert(false);
    setLoading(true);

    const redirectTo = resolveRedirect(location.state);

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      toast.error(apiErrorMessage(caught, t, { UNAUTHORIZED: "errorEmailPassword" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t("login")}</h1>
        <p className="mt-1.5 text-sm text-slate-400">{t("loginPage.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        {showRegisteredAlert && (
          <p className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3.5 py-2.5 text-sm text-green-300">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t("registerSuccess")}</span>
          </p>
        )}

        <TextField
          id="email"
          type="email"
          label={t("email")}
          value={email}
          onChange={setEmail}
          placeholder={t("loginPage.emailPlaceholder")}
          autoComplete="email"
          required
        />

        <TextField
          id="password"
          type="password"
          label={t("password")}
          value={password}
          onChange={setPassword}
          placeholder={t("loginPage.passwordPlaceholder")}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t("loading") : t("loginButton")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {t("loginPage.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-blue-400 transition hover:text-blue-300">
          {t("loginPage.signUp")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
