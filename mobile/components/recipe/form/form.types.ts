// 타입 

export type IngredientUnit = "개" | "g" | "ml" | "스푼";

export type IngredientItem = {
    id: number;
    name: string;
    amount: string;
    unit: IngredientUnit;
    category: string;
};

export type StepItem = {
    id: number;
    value: string;
};

// 디자인 토큰 

export const ORANGE = "#ff8a3d";
export const GRAY = "#e8e8e8";

// 카테고리 상수 

/** 카테고리별 단위 옵션. 길이가 1이면 고정 텍스트로 표시 */
export const CATEGORY_UNITS: Record<string, IngredientUnit[]> = {
    "채소/과일": ["개"],
    "단백질": ["개", "g"],
    "탄수화물": ["개", "g"],
    "액체": ["ml", "g"],
    "소스/조미료": ["스푼", "ml", "g"],
    "기타": ["개", "스푼", "ml", "g"],
};

export const CATEGORIES = [
    { label: "채소/과일", sub: "당근, 사과 등", emoji: "🥦" },
    { label: "단백질", sub: "고기, 해산물 등", emoji: "🥩" },
    { label: "탄수화물", sub: "밥, 면", emoji: "🍚" },
    { label: "액체", sub: "물, 육수 등", emoji: "💧" },
    { label: "소스/조미료", sub: "간장, 설탕 등", emoji: "🧂" },
    { label: "기타", sub: "견과류, 치즈 등", emoji: "📦" },
] as const;

// 헬퍼 함수 

export const getDefaultUnit = (category: string): IngredientUnit =>
    (CATEGORY_UNITS[category] ?? ["개"])[0];

export const getCategoryEmoji = (label: string): string =>
    CATEGORIES.find((c) => c.label === label)?.emoji ?? "📦";

export function groupByCategory(
    items: IngredientItem[]
): { category: string; items: IngredientItem[] }[] {
    const order: string[] = [];
    const map: Record<string, IngredientItem[]> = {};
    for (const item of items) {
        if (!map[item.category]) {
            order.push(item.category);
            map[item.category] = [];
        }
        map[item.category].push(item);
    }
    return order.map((cat) => ({ category: cat, items: map[cat] }));
}
