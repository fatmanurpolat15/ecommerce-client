import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth";
import { apiErrorMessage } from "../api/apiErrorMessage";
import {
  checkPasswordRules,
  fullName,
  hasErrors,
  validateRegister,
  MIN_PASSWORD_LENGTH,
} from "../utils/validators";
import type { RegisterFieldErrors } from "../utils/validators";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";

function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const passwordRules = checkPasswordRules(password);

  if (token) {
    return <Navigate to="/products" replace />;
  }

  function clearFieldError(field: keyof RegisterFieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateRegister(firstName, lastName, email, password, t);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName(firstName, lastName));
      navigate("/login", { state: { registered: true } });
    } catch (caught) {
      toast.error(apiErrorMessage(caught, t, { CONFLICT: "errorEmailExists" }));
    } finally {
      setLoading(false);
    }
  }

  const ruleItems = [
    { ok: passwordRules.length, label: t("registerPage.rules.length", { min: MIN_PASSWORD_LENGTH }) },
    { ok: passwordRules.uppercase, label: t("registerPage.rules.uppercase") },
    { ok: passwordRules.number, label: t("registerPage.rules.number") },
    { ok: passwordRules.special, label: t("registerPage.rules.special") },
  ];

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? t("registerPage.hidePassword") : t("registerPage.showPassword")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {showPassword ? (
          <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
        ) : (
          <>
            <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </>
        )}
      </svg>
    </button>
  );

  const passwordRulesList = (
    <ul id="password-rules" className="mt-2 space-y-1">
      {ruleItems.map(({ ok, label }) => (
        <li key={label} className="flex items-center gap-1.5 text-xs">
          <svg
            className={`h-3.5 w-3.5 shrink-0 ${ok ? "text-green-400" : "text-slate-600"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {ok ? <path d="M5 13l4 4L19 7" /> : <circle cx="12" cy="12" r="5" />}
          </svg>
          <span className={ok ? "text-green-400" : "text-slate-500"}>{label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t("registerPage.title")}</h1>
        <p className="mt-1.5 text-sm text-slate-400">{t("registerPage.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="firstName"
            label={t("firstName")}
            value={firstName}
            onChange={(value) => {
              setFirstName(value);
              clearFieldError("firstName");
            }}
            placeholder={t("registerPage.firstNamePlaceholder")}
            autoComplete="given-name"
            error={fieldErrors.firstName}
          />

          <TextField
            id="lastName"
            label={t("lastName")}
            value={lastName}
            onChange={(value) => {
              setLastName(value);
              clearFieldError("lastName");
            }}
            placeholder={t("registerPage.lastNamePlaceholder")}
            autoComplete="family-name"
            error={fieldErrors.lastName}
          />
        </div>

        <TextField
          id="email"
          type="email"
          label={t("email")}
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
          placeholder={t("registerPage.emailPlaceholder")}
          autoComplete="email"
          error={fieldErrors.email}
        />

        <TextField
          id="password"
          type={showPassword ? "text" : "password"}
          label={t("password")}
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          placeholder={t("registerPage.passwordPlaceholder")}
          autoComplete="new-password"
          error={fieldErrors.password}
          describedBy="password-rules"
          trailing={passwordToggle}
          footer={passwordRulesList}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t("loading") : t("registerButton")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {t("registerPage.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-blue-400 transition hover:text-blue-300">
          {t("registerPage.signIn")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
