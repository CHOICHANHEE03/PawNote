import React, { useState, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import MonthCalendar, { DatePhotoMap } from "@/components/calendar/MonthCalendar";
import DayContent, { DayEntry } from "@/components/calendar/DayContent";
import CreateButton from "@/components/common/createButton";

function dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 목업 데이터 (API 연동 전)
const today = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const ym = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

const MOCK_ENTRIES: Record<string, DayEntry> = {
  [`${ym}-${pad(today.getDate())}`]: {
    photos: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    ],
    companion: "우리 엄마랑",
    recipes: [
      {
        id: 1,
        title: "된장찌개",
        subtitle: "엄마가 알려준 집밥 된장찌개",
        thumbnailUrl: "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=200",
      },
      {
        id: 2,
        title: "계란말이",
        subtitle: "아침 반찬으로 딱인 폭신한 계란말이",
        thumbnailUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200",
      },
    ],
    memo: {
      title: "오늘의 집밥",
      content: "오늘은 오랜만에 집밥을 해먹었다. 된장찌개는 역시 집에서 끓여야 제맛. 계란말이도 생각보다 잘 됐고, 다음엔 치즈 넣어봐야겠다. 🍳",
    },
  },
  [`${ym}-${pad(Math.max(1, today.getDate() - 3))}`]: {
    photos: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"],
    companion: "혼자서",
    recipes: [
      {
        id: 3,
        title: "파스타 알리오 올리오",
        subtitle: "마늘과 올리브오일의 조화",
        thumbnailUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
      },
    ],
    memo: {
      title: "간단한 혼밥",
      content: "간단하게 파스타 해먹음. 면 삶는 타이밍이 제일 중요한 것 같다.",
    },
  },
  [`${ym}-${pad(Math.max(1, today.getDate() - 7))}`]: {
    companion: "친구들이랑",
    recipes: [
      {
        id: 4,
        title: "김치볶음밥",
        subtitle: "냉장고 파먹기 김치볶음밥",
        thumbnailUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200",
      },
    ],
  },
};

// MOCK_ENTRIES.photos에서 달력 셀용 DatePhotoMap 자동 생성 
function buildPhotoMap(entries: Record<string, DayEntry>): DatePhotoMap {
    const map: DatePhotoMap = {};
    Object.entries(entries).forEach(([key, entry]) => {
        if (entry.photos && entry.photos.length > 0) {
            map[key] = entry.photos;
        }
    });
    return map;
}
const MOCK_PHOTOS = buildPhotoMap(MOCK_ENTRIES);

export default function CalendarScreen() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const currentEntry = MOCK_ENTRIES[dateKey(selectedDate)];
    // 로딩 중에는 직전 entry를 그대로 보여줘서 깜빡임 방지
    const lastEntryRef = useRef(currentEntry);
    if (!loading) lastEntryRef.current = currentEntry;
    const entry = loading ? lastEntryRef.current : currentEntry;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <MonthCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    photos={MOCK_PHOTOS}
                    onTransitionChange={setLoading}
                />

                <View style={styles.divider} />

                <DayContent
                    date={selectedDate}
                    entry={entry}
                    loading={loading}
                    onRecipePress={(id) => router.push(`/recipe/${id}` as any)}
                />
            </ScrollView>

            <View style={styles.fabArea}>
                <CreateButton onPress={() => { }} icon="edit-calendar" />
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
