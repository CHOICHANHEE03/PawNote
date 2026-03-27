import { useQuery } from "@tanstack/react-query";
import { getCalendarMonthEntries, CalendarEntryResponse } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

export function useCalendarMonthEntries(year: number, month: number) {
  const { accessToken } = useAuthStore();

  return useQuery<CalendarEntryResponse[]>({
    queryKey: ["calendar", "month", year, month],
    queryFn: () => getCalendarMonthEntries({ year, month, accessToken: accessToken! }),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
  });
}
