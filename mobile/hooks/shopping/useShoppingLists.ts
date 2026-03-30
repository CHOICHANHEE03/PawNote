import { useQuery } from "@tanstack/react-query";
import { getShoppingLists } from "@/services/api/shoppingApi";
import { useAuthStore } from "@/stores/authStore";

export function useShoppingLists() {
    const { accessToken } = useAuthStore();

    return useQuery({
        queryKey: ["shoppingLists"],
        queryFn: () => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return getShoppingLists(accessToken);
        },
        enabled: !!accessToken,
    });
}
