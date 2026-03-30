export const ORANGE = "#F5A54C";
export const MAX_PHOTOS = 2;
export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export type SelectedRecipe = { id: number; title: string; subtitle?: string };

export function parseDateParam(str?: string): Date {
  if (!str) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateToKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
