import { useQuery } from "@tanstack/react-query";
import { getCalendarEntries, CalendarEntryResponse } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

export function useCalendarEntries() {
  const { accessToken } = useAuthStore();

  return useQuery<CalendarEntryResponse[]>({
    queryKey: ["calendar"],
    queryFn: () => getCalendarEntries({ accessToken: accessToken! }),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
  });
}
