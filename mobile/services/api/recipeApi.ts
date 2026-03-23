import { IngredientUnit } from "@/components/recipe/create.types";

export type RecipeCreatePayload = {
    title: string;
    subtitle: string;
    servings: number;
    ingredients: {
        name: string;
        amount: string;
        unit: IngredientUnit;
        category: string;
    }[];
    steps: {
        stepOrder: number;
        content: string;
    }[];
    videoLink?: string;
};

type CreateRecipeParams = {
    payload: RecipeCreatePayload;
    imageUri?: string;
    accessToken: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function createRecipe({
    payload,
    imageUri,
    accessToken,
}: CreateRecipeParams) {
    const formData = new FormData();

    formData.append("request", JSON.stringify(payload));

    if (imageUri) {
        formData.append(
            "image",
            {
                uri: imageUri,
                name: "recipe-image.jpg",
                type: "image/jpeg",
            } as any
        );
    }

    console.log("===== createRecipe 호출 =====");
    console.log("accessToken:", accessToken);
    console.log("API URL:", `${API_BASE_URL}/api/recipes`);

    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    const rawText = await response.text();
    let data = null;

    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
        console.log("JSON 파싱 에러:", e);
    }

    if (!response.ok) {
        const error: any = new Error(data?.message || rawText || "레시피 저장 실패");
        error.response = {
            status: response.status,
            data: data || { message: rawText },
        };
        throw error;
    }

    return data;
}