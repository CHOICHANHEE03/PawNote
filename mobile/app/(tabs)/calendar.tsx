import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MonthCalendar, { DatePhotoMap } from "@/components/calendar/MonthCalendar";
import DayContent, { DayEntry } from "@/components/calendar/DayContent";
import CreateButton from "@/components/common/createButton";
import { useCalendarEntries } from "@/hooks/calendar/useCalendarEntries";
import { useCalendarDayEntry } from "@/hooks/calendar/useCalendarDayEntry";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import { ScrollView } from "react-native";

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 달력 사진 맵
  const { data: allEntries = [] } = useCalendarEntries();
  const photoMap = useMemo<DatePhotoMap>(() => {
    const map: DatePhotoMap = {};
    allEntries.forEach((entry) => {
      if (entry.imageUrls.length > 0) map[entry.date] = entry.imageUrls;
    });
    return map;
  }, [allEntries]);

  // 선택된 날짜 기록
  const { data: dayEntries = [], isLoading: dayLoading } = useCalendarDayEntry(selectedDate);

  // 레시피 목록 (이름/썸네일 조합용)
  const { data: recipeList = [] } = useRecipeList();

  // DayEntry 변환
  const entry = useMemo<DayEntry | undefined>(() => {
    const raw = dayEntries[0];
    if (!raw) return undefined;

    const recipes = raw.recipeIds
      .map((id) => recipeList.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => !!r)
      .map((r) => ({ id: r.id, title: r.title, subtitle: r.subtitle, thumbnailUrl: r.imageUrl }));

    return {
      photos: raw.imageUrls.length > 0 ? raw.imageUrls : undefined,
      companion: raw.companion,
      recipes: recipes.length > 0 ? recipes : undefined,
      memo:
        raw.memoTitle || raw.memoContent
          ? { title: raw.memoTitle ?? "", content: raw.memoContent ?? "" }
          : undefined,
    };
  }, [dayEntries, recipeList]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          photos={photoMap}
        />

        <View style={styles.divider} />

        <DayContent
          date={selectedDate}
          entry={entry}
          loading={dayLoading}
          onRecipePress={(id) => router.push(`/recipe/${id}` as any)}
        />
      </ScrollView>

      <View style={styles.fabArea}>
        <CreateButton onPress={() => router.push(`/calendar/create?date=${dateKey(selectedDate)}` as any)} icon="edit-calendar" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  divider: {
    height: 1,
    backgroundColor: "#ebe8e2",
    marginHorizontal: 16,
    marginBottom: 4,
  },
  fabArea: {
    position: "absolute",
    right: 16,
    bottom: 20,
  },
});
