import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCalendarEntry } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

export function useDeleteCalendarEntry() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      if (!accessToken) throw new Error("인증 토큰이 없습니다.");
      return deleteCalendarEntry({ id, accessToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
