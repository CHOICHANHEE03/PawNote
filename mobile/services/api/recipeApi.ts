import { IngredientUnit } from "@/components/recipe/create/create.types";

export type RecipeListItem = {
    id: number;
    title: string;
    subtitle: string;
    imageUrl?: string;
    videoLink?: string;
    servings?: number;
};

export type RecipeDetail = {
    id: number;
    title: string;
    subtitle: string;
    imageUrl?: string;
    videoLink?: string;
    servings: number;
    ingredients: {
        name: string;
        amount: string;
        unit: string;
        category: string;
    }[];
    steps: {
        stepOrder: number;
        content: string;
    }[];
};

type GetRecipeDetailParams = {
    id: number;
    accessToken: string;
};

export async function getRecipeDetail({ id, accessToken }: GetRecipeDetailParams): Promise<RecipeDetail> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
        console.log("getRecipeDetail JSON 파싱 에러:", e);
    }

    if (!response.ok) {
        const error: any = new Error(data?.message || rawText || "레시피 상세 조회 실패");
        error.response = { status: response.status, data };
        throw error;
    }

    return data;
}

type GetRecipesParams = {
    accessToken: string;
    page?: number;
    size?: number;
};

export async function getRecipes({ accessToken, page = 0, size = 20 }: GetRecipesParams): Promise<RecipeListItem[]> {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const response = await fetch(`${API_BASE_URL}/api/recipes?page=${page}&size=${size}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
        console.log("getRecipes JSON 파싱 에러:", e);
    }

    if (!response.ok) {
        const error: any = new Error(data?.message || rawText || "레시피 목록 조회 실패");
        error.response = { status: response.status, data };
        throw error;
    }

    return data;
}

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