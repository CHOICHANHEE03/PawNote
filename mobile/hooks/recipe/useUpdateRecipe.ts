import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecipe, RecipeCreatePayload } from "@/services/api/recipeApi";
import { useAuthStore } from "@/stores/authStore";

type UpdateRecipeVariables = {
    id: number;
    payload: RecipeCreatePayload;
    imageUri?: string;
};

export function useUpdateRecipe() {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();

    return useMutation({
        mutationFn: ({ id, payload, imageUri }: UpdateRecipeVariables) => {
            if (!accessToken) throw new Error("인증 토큰이 없습니다.");
            return updateRecipe({ id, payload, imageUri, accessToken });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            queryClient.invalidateQueries({ queryKey: ["recipe", variables.id] });
        },
    });
}
