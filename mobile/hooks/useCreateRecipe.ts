import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRecipe, RecipeCreatePayload } from "@/services/api/recipeApi";
import { useAuthStore } from "@/stores/authStore";

type CreateRecipeVariables = {
    payload: RecipeCreatePayload;
    imageUri?: string;
};

export function useCreateRecipe() {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();

    return useMutation({
        mutationFn: ({ payload, imageUri }: CreateRecipeVariables) => {
            if (!accessToken) {
                throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
            }
            return createRecipe({ payload, imageUri, accessToken });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
        },
    });
}