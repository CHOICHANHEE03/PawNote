import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShoppingList, ShoppingListCreatePayload } from "@/services/api/shoppingApi";
import { useAuthStore } from "@/stores/authStore";

export function useUpdateShoppingList() {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: ShoppingListCreatePayload }) => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
            return updateShoppingList({ id, payload, accessToken });
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
            queryClient.invalidateQueries({ queryKey: ["shoppingList", id] });
        },
    });
}
