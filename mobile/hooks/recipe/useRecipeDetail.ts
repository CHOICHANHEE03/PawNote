import { useQuery } from "@tanstack/react-query";
import { getRecipeDetail, RecipeDetail } from "@/services/api/recipeApi";
import { useAuthStore } from "@/stores/authStore";

export function useRecipeDetail(id: number) {
    const { accessToken } = useAuthStore();

    return useQuery<RecipeDetail>({
        queryKey: ["recipe", id],
        queryFn: () => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return getRecipeDetail({ id, accessToken });
        },
        enabled: !!accessToken && !!id,
        staleTime: 1000 * 60 * 5,
    });
}
