import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
] as const;

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5 p-0.5"
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
                : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
