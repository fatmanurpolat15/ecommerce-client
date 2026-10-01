import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import { toApiError } from "../api/axiosInstance";

const DEFAULT_REDIRECT = "/products";

const FLOATING_ICONS = [
  { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894l9.553 4.772a1 1 0 010 1.788l-9.553 4.772A1 1 0 019 20z", delay: "0s", top: "16%", left: "12%" },
  { icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z", delay: "-4s", top: "68%", left: "8%" },
  { icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z", delay: "-8s", top: "22%", left: "82%" },
  { icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941", delay: "-11s", top: "74%", left: "86%" },
  { icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", delay: "-6s", top: "86%", left: "18%" },
  { icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", delay: "-2s", top: "8%", left: "88%" },
] as const;

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to={resolveRedirect(location.state)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = resolveRedirect(location.state);

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      const apiError = toApiError(caught);
      setError(
        apiError.code === "UNAUTHORIZED"
          ? t("errorEmailPassword")
          : apiError.code === "NETWORK_ERROR"
            ? t("errorNetwork")
            : apiError.message || t("errorGeneric"),
      );
    } finally {
      setLoading(false);
    }
  }

return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-16">
      {/* Sabit arka plan */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.14),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Aurora tabakaları */}
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
        <div className="animate-aurora absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-blue-400/45 via-sky-300/35 to-transparent blur-3xl" />
        <div
          className="animate-aurora absolute -bottom-32 -right-24 h-[38rem] w-[38rem] rounded-full bg-gradient-to-tr from-indigo-400/40 via-sky-300/35 to-transparent blur-3xl"
          style={{ animationDelay: "-7s", animationDuration: "24s" }}
        />
      </div>

      {/* Dönen çemberler */}
      <div
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/50"
        aria-hidden="true"
      >
        <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-500 shadow-[0_0_16px_4px_rgba(59,130,246,0.6)]" />
      </div>
      <div
        className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sky-300/60"
        style={{ animationDirection: "reverse", animationDuration: "80s" }}
        aria-hidden="true"
      />

      {/* Yörüngedeki parıltı noktaları */}
      <div
        className="animate-orbit pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <span className="animate-sparkle block h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.7)]" />
      </div>
      <div
        className="animate-orbit pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ animationDirection: "reverse", animationDuration: "38s", animationDelay: "-12s" }}
        aria-hidden="true"
      >
        <span
          className="animate-sparkle block h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]"
          style={{ animationDelay: "-1.5s" }}
        />
      </div>

      {/* Akan grid */}
      <div className="animate-drift pointer-events-none absolute inset-x-0 top-0 h-[120%] opacity-40" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      {/* Yüzen ışık lekeleri */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-float-slow absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-blue-300/35 blur-3xl" />
        <div className="animate-float-slower absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-sky-200/45 blur-3xl" />
        <div
          className="animate-float-slow absolute left-1/3 -top-20 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      {/* Süzülen ikon rozetleri */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {FLOATING_ICONS.map(({ icon, delay, top, left }, index) => (
          <span
            key={index}
            className="animate-float-slow absolute flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-blue-500 shadow-lg shadow-blue-200/40 backdrop-blur-sm"
            style={{ top, left, animationDelay: delay, animationDuration: `${13 + index * 2}s` }}
          >
            <span
              className="absolute inset-0 rounded-xl bg-blue-400/20"
              style={{ animation: `pulse-ring 3.4s ease-out ${delay} infinite` }}
            />
            <svg
              className="relative h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d={icon} />
            </svg>
          </span>
        ))}
      </div>

      {/* Kart */}
      <div className="relative w-full max-w-sm">
        {/* Kart çevresi ışık halkası */}
        <div
          className="animate-conic-spin pointer-events-none absolute -inset-[3px] rounded-[1.7rem] opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.9) 70deg, rgba(56,189,248,0.9) 130deg, transparent 200deg, transparent 360deg)",
            filter: "blur(10px)",
          }}
          aria-hidden="true"
        />

        <div className="animate-fade-up relative rounded-2xl border border-slate-200/90 bg-white/85 p-8 shadow-2xl shadow-blue-900/15 backdrop-blur-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="animate-fade-up-delay-1 relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-600/30">
              <span
                className="absolute inset-0 rounded-xl ring-2 ring-blue-400/60"
                style={{ animation: "pulse-ring 2.8s ease-out infinite" }}
              />
              <svg
                className="relative h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>

            <h1 className="animate-fade-up-delay-2 mt-5 text-xl font-semibold tracking-tight text-slate-900">
              {t("login")}
            </h1>
            <p className="animate-fade-up-delay-3 mt-1.5 text-sm text-slate-500">
              {t("loginPage.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="animate-fade-up-delay-2">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("loginPage.emailPlaceholder")}
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="animate-fade-up-delay-3">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("loginPage.passwordPlaceholder")}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
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
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("loading") : t("loginButton")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default Login;