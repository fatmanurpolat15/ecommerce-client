import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavbarItem {
  label: string;
  path: string;
}

function Navbar() {
  const { token, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems: NavbarItem[] =
    user?.role === "ADMIN"
      ? [
          { label: t("products"), path: "/products" },
          { label: t("category"), path: "/categories" },
          { label: t("adminOrders"), path: "/admin/orders" },
          { label: t("payments"), path: "/admin/payments" },
          { label: t("stock"), path: "/stocks" },
          { label: t("users"), path: "/users" },
        ]
      : token
      ? [
          { label: t("products"), path: "/products" },
          { label: t("cart"), path: "/cart" },
          { label: t("orders"), path: "/orders" },
        ]
      : [{ label: t("products"), path: "/products" }];

  function handleLogout() {
    logout();
    setMobileOpen(false);
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

        <div className="hidden md:flex items-center gap-1 ml-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {token ? (
            <>
              <LanguageSwitcher />

              <div className="flex items-center gap-2.5">
                <Link
                  to="/profile"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-xs font-bold uppercase text-white shadow-md shadow-blue-600/25 transition hover:opacity-90"
                >
                  {(user?.name ?? user?.email ?? "?").charAt(0)}
                  <span
                    className="absolute -inset-0.5 rounded-full ring-1 ring-blue-400/60"
                    style={{ animation: "pulse-ring 3.2s ease-out infinite" }}
                    aria-hidden="true"
                  />
                </Link>
                <span className="hidden text-sm font-medium text-slate-200 xl:inline">
                  {user?.name ?? user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                >
                  {t("logout")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
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

      {token && mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="truncate text-sm font-medium text-slate-200">
              {user?.name ?? user?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
