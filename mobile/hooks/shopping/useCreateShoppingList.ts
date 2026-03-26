import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShoppingList, ShoppingListCreatePayload } from "@/services/api/shoppingApi";
import { useAuthStore } from "@/stores/authStore";

export function useCreateShoppingList() {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();

    return useMutation({
        mutationFn: (payload: ShoppingListCreatePayload) => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
            return createShoppingList({ payload, accessToken });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
        },
    });
}
