import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCalendarEntry, CalendarCreatePayload } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

type Params = {
  payload: CalendarCreatePayload;
  imageUris?: string[];
};

export function useCreateCalendarEntry() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageUris }: Params) => {
      if (!accessToken) throw new Error("인증 토큰이 없습니다.");
      return createCalendarEntry({ payload, imageUris, accessToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
