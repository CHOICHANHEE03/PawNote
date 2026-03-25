import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRecipe } from "@/services/api/recipeApi";
import { useAuthStore } from "@/stores/authStore";

export function useDeleteRecipe() {
    const { accessToken } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return deleteRecipe({ id, accessToken });
        },
        onSuccess: () => {
            // 삭제 후 레시피 목록 갱신
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
}
