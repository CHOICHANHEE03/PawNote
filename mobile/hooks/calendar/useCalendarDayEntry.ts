import { useQuery } from "@tanstack/react-query";
import { getCalendarDayEntries, CalendarEntryResponse } from "@/services/api/calendarApi";
import { useAuthStore } from "@/stores/authStore";

function dateToStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function useCalendarDayEntry(date: Date) {
  const { accessToken } = useAuthStore();
  const dateStr = dateToStr(date);

  return useQuery<CalendarEntryResponse[]>({
    queryKey: ["calendar", "date", dateStr],
    queryFn: () => getCalendarDayEntries({ date: dateStr, accessToken: accessToken! }),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2,
  });
}
