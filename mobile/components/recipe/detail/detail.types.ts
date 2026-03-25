import { RecipeDetail } from "@/services/api/recipeApi";

export type { RecipeDetail };

export type IngredientGroup = {
  category: string;
  items: RecipeDetail["ingredients"];
};

// 유틸 함수

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

export function scaleAmount(amount: string, ratio: number): string {
  if (ratio === 1) return amount;
  const trimmed = amount.trim();

  const num = parseFloat(trimmed);
  if (!isNaN(num) && String(num) === trimmed) {
    const scaled = Math.round(num * ratio * 10) / 10;
    return scaled % 1 === 0 ? String(scaled) : String(scaled);
  }

  const frac = trimmed.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const val = Number(frac[1]) / Number(frac[2]);
    const scaled = Math.round(val * ratio * 10) / 10;
    return scaled % 1 === 0 ? String(scaled) : String(scaled);
  }

  return amount;
}

export function groupIngredients(
  ingredients: RecipeDetail["ingredients"]
): IngredientGroup[] {
  const order: string[] = [];
  const map: Record<string, RecipeDetail["ingredients"]> = {};
  for (const ing of ingredients) {
    if (!map[ing.category]) {
      order.push(ing.category);
      map[ing.category] = [];
    }
    map[ing.category].push(ing);
  }
  return order.map((cat) => ({ category: cat, items: map[cat] }));
}
