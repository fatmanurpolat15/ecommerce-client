import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { token, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/products", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center px-4 py-3.5">
        <Link to="/products" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-lg shadow-blue-500/30">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight text-white">{t("brand")}</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher />

          {token ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-xs font-bold uppercase text-white shadow-md shadow-blue-600/25">
                  {(user?.name ?? user?.email ?? "?").charAt(0)}
                  <span
                    className="absolute -inset-0.5 rounded-full ring-1 ring-blue-400/60"
                    style={{ animation: "pulse-ring 3.2s ease-out infinite" }}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {user?.name ?? user?.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
              >
                {t("login")}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
