import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShoppingList } from "@/services/api/shoppingApi";
import { useAuthStore } from "@/stores/authStore";

export function useDeleteShoppingList() {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();

    return useMutation({
        mutationFn: (id: number) => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
            return deleteShoppingList(id, accessToken);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
        },
    });
}
