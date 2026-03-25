import { useQuery } from "@tanstack/react-query";
import { getRecipes, RecipeListItem } from "@/services/api/recipeApi";
import { useAuthStore } from "@/stores/authStore";

export function useRecipeList() {
    const { accessToken } = useAuthStore();

    return useQuery<RecipeListItem[]>({
        queryKey: ["recipes"],
        queryFn: () => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return getRecipes({ accessToken });
        },
        enabled: !!accessToken,
        staleTime: 1000 * 60 * 5, // 5분
    });
}
