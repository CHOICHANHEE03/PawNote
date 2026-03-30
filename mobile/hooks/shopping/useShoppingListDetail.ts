import { useQuery } from "@tanstack/react-query";
import { getShoppingListDetail } from "@/services/api/shoppingApi";
import { useAuthStore } from "@/stores/authStore";

export function useShoppingListDetail(id: number) {
    const { accessToken } = useAuthStore();

    return useQuery({
        queryKey: ["shoppingList", id],
        queryFn: () => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return getShoppingListDetail(id, accessToken);
        },
        enabled: !!accessToken && !!id,
    });
}
