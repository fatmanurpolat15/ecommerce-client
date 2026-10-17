import type { TFunction } from "i18next";

export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_UPPERCASE = /\p{Lu}/u;
const HAS_NUMBER = /\p{Nd}/u;
const HAS_SPECIAL = /[^\p{L}\p{N}\s]/u;

export interface RegisterFieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface PasswordRuleResult {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
}

export function checkPasswordRules(password: string): PasswordRuleResult {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    uppercase: HAS_UPPERCASE.test(password),
    number: HAS_NUMBER.test(password),
    special: HAS_SPECIAL.test(password),
  };
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function validateRegister(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  t: TFunction,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!firstName.trim()) {
    errors.firstName = t("registerPage.errors.firstNameRequired");
  }

  if (!lastName.trim()) {
    errors.lastName = t("registerPage.errors.lastNameRequired");
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = t("registerPage.errors.emailRequired");
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = t("registerPage.errors.emailInvalid");
  }

  const rules = checkPasswordRules(password);

  if (!password) {
    errors.password = t("registerPage.errors.passwordRequired");
  } else if (!rules.length) {
    errors.password = t("registerPage.errors.passwordShort", { min: MIN_PASSWORD_LENGTH });
  } else if (!rules.uppercase) {
    errors.password = t("registerPage.errors.passwordUppercase");
  } else if (!rules.number) {
    errors.password = t("registerPage.errors.passwordNumber");
  } else if (!rules.special) {
    errors.password = t("registerPage.errors.passwordSpecial");
  }

  return errors;
}

export function hasErrors(errors: RegisterFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
