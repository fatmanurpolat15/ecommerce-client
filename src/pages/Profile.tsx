import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t("profile")}</h1>
        <p className="mt-1.5 text-sm text-slate-400">{t("profileSubtitle")}</p>
      </div>

      <div className="animate-fade-up mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-lg font-bold uppercase text-white shadow-md shadow-blue-600/25">
            {(user?.name ?? user?.email ?? "?").charAt(0)}
          </span>
          <div>
            <p className="text-base font-semibold text-white">{user?.name ?? user?.email}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-8 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <dt className="text-sm text-slate-400">{t("email")}</dt>
            <dd className="text-sm font-medium text-slate-100">{user?.email}</dd>
          </div>
        </dl>
      </div>

      {user?.role === "ADMIN" ? (
        <div className="animate-fade-up mt-6 flex flex-col gap-3">
          <Link
            to="/admin/orders"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("adminOrders")}
          </Link>
          <Link
            to="/admin/payments"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("payments")}
          </Link>
          <Link
            to="/stocks"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("stock")}
          </Link>
          <Link
            to="/users"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("users")}
          </Link>
        </div>
      ) : (
        <div className="animate-fade-up mt-6 flex flex-col gap-3">
          <Link
            to="/cart"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("cart")}
          </Link>
          <Link
            to="/orders"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("orders")}
          </Link>
          <Link
            to="/addresses"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {t("addresses")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default Profile;
