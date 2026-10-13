import type { TFunction } from "i18next";

const CATEGORY_KEYS: Record<string, string> = {
  bilgisayar: "categories.computer",
  telefon: "categories.phone",
  kulaklık: "categories.headphones",
  klavye: "categories.keyboard",
  mouse: "categories.mouse",
};

export function translateCategoryName(categoryName: string, t: TFunction): string {
  const key = CATEGORY_KEYS[categoryName.trim().toLocaleLowerCase("tr")];

  return key ? t(key) : categoryName;
}