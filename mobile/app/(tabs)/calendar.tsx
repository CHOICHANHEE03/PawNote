import React, { useState, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import MonthCalendar, { DatePhotoMap } from "@/components/calendar/MonthCalendar";
import DayContent, { DayEntry } from "@/components/calendar/DayContent";
import CreateButton from "@/components/common/createButton";
import { useCalendarMonthEntries } from "@/hooks/calendar/useCalendarMonthEntries";
import { useCalendarDayEntry } from "@/hooks/calendar/useCalendarDayEntry";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import { useDeleteCalendarEntry } from "@/hooks/calendar/useDeleteCalendarEntry";
import { ScrollView } from "react-native";

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 달력 사진 맵
  const { data: monthEntries = [] } = useCalendarMonthEntries(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1
  );
  const photoMap = useMemo<DatePhotoMap>(() => {
    const map: DatePhotoMap = {};
    monthEntries.forEach((entry) => {
      if (entry.imageUrls.length > 0) map[entry.date] = entry.imageUrls;
    });
    return map;
  }, [monthEntries]);

  // 선택된 날짜 기록
  const { data: dayEntries = [], isLoading: dayLoading } = useCalendarDayEntry(selectedDate);
  const rawEntry = dayEntries[0];

  // 레시피 목록 (이름/썸네일 조합용)
  const { data: recipeList = [] } = useRecipeList();

  // DayEntry 변환
  const entry = useMemo<DayEntry | undefined>(() => {
    if (!rawEntry) return undefined;

    const recipes = rawEntry.recipeIds
      .map((id) => recipeList.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => !!r)
      .map((r) => ({ id: r.id, title: r.title, subtitle: r.subtitle, thumbnailUrl: r.imageUrl }));

    return {
      photos: rawEntry.imageUrls.length > 0 ? rawEntry.imageUrls : undefined,
      companion: rawEntry.companion,
      recipes: recipes.length > 0 ? recipes : undefined,
      memo:
        rawEntry.memoTitle || rawEntry.memoContent
          ? { title: rawEntry.memoTitle ?? "", content: rawEntry.memoContent ?? "" }
          : undefined,
    };
  }, [rawEntry, recipeList]);

  const { mutate: deleteEntry } = useDeleteCalendarEntry();

  const handleDelete = () => {
    if (!rawEntry) return;
    Alert.alert("기록 삭제", "이 날의 기록을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteEntry(rawEntry.id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          photos={photoMap}
        />

        <View style={styles.divider} />

        <DayContent
          date={selectedDate}
          entry={entry}
          entryId={rawEntry?.id}
          loading={dayLoading}
          onRecipePress={(id) => router.push(`/recipe/${id}` as any)}
          onEditPress={() =>
            rawEntry && router.push(`/calendar/create?id=${rawEntry.id}&date=${dateKey(selectedDate)}` as any)
          }
          onDeletePress={handleDelete}
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
