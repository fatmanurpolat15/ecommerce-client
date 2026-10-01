import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";

const LANGUAGES = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
] as const;

function Navbar() {
  const { token, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center px-4 py-3.5">
        <div className="ml-auto flex items-center gap-4">
          <div
            role="group"
            aria-label={t("language")}
            className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
          >
            {LANGUAGES.map(({ code, label }) => {
              const isActive = i18n.language === code;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => void i18n.changeLanguage(code)}
                  aria-pressed={isActive}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {token ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-xs font-bold uppercase text-white shadow-md shadow-blue-600/25">
                  {(user?.name ?? user?.email ?? "?").charAt(0)}
                  <span
                    className="absolute -inset-0.5 rounded-full ring-1 ring-blue-300"
                    style={{ animation: "pulse-ring 3.2s ease-out infinite" }}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {user?.name ?? user?.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-200/80 bg-red-50/80 px-3.5 py-1.5 text-sm font-medium text-red-600 backdrop-blur transition hover:bg-red-100/80"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
            >
              {t("login")}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;