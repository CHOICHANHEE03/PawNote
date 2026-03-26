const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type ShoppingItem = {
    text: string;
    checked: boolean;
};

export type ShoppingListCreatePayload = {
    title: string;
    items: ShoppingItem[];
};

type CreateShoppingListParams = {
    payload: ShoppingListCreatePayload;
    accessToken: string;
};

export async function createShoppingList({ payload, accessToken }: CreateShoppingListParams) {
    const response = await fetch(`${API_BASE_URL}/shopping-lists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
        console.log("JSON 파싱 에러:", e);
    }

    if (!response.ok) {
        const error: any = new Error(data?.message || rawText || "장보기 목록 저장 실패");
        error.response = { status: response.status, data: data || { message: rawText } };
        throw error;
    }

    return data;
}
