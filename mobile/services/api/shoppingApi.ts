const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type ShoppingItem = {
    text: string;
    checked: boolean;
    type?: "check" | "category";
};

export type ShoppingListCreatePayload = {
    title: string;
    items: ShoppingItem[];
};

export type ShoppingListSummary = {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type ShoppingListItemDetail = {
    id: number;
    text: string;
    checked: boolean;
    type: "check" | "category";
    itemOrder: number;
};

export type ShoppingListDetail = {
    id: number;
    userId: number;
    title: string;
    items: ShoppingListItemDetail[];
    createdAt: string;
    updatedAt: string;
};

type CreateShoppingListParams = {
    payload: ShoppingListCreatePayload;
    accessToken: string;
};

export async function getShoppingLists(accessToken: string): Promise<ShoppingListSummary[]> {
    const response = await fetch(`${API_BASE_URL}/shopping-lists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("장보기 목록 조회 실패");
    return response.json();
}

export async function getShoppingListDetail(id: number, accessToken: string): Promise<ShoppingListDetail> {
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("장보기 상세 조회 실패");
    return response.json();
}

export async function updateShoppingList({
    id,
    payload,
    accessToken,
}: {
    id: number;
    payload: ShoppingListCreatePayload;
    accessToken: string;
}): Promise<ShoppingListDetail> {
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("장보기 목록 수정 실패");
    return response.json();
}

export async function deleteShoppingList(id: number, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("장보기 목록 삭제 실패");
}

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
