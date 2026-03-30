import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCalendarEntry, CalendarUpdatePayload } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

type Params = {
  id: number;
  payload: CalendarUpdatePayload;
  existingImageUrls?: string[];
  newImageUris?: string[];
};

export function useUpdateCalendarEntry() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, existingImageUrls, newImageUris }: Params) => {
      if (!accessToken) throw new Error("인증 토큰이 없습니다.");
      return updateCalendarEntry({ id, payload, existingImageUrls, newImageUris, accessToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
