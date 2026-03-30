import React, { useState, useRef, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDE_PADDING = 16;
const CELL_WIDTH = Math.floor((SCREEN_WIDTH - SIDE_PADDING * 2) / 7);
const CELL_HEIGHT = 82;
const PHOTO_HEIGHT = 44;
const SWIPE_THRESHOLD = 50;
const ANIM_DURATION = 260;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export type DatePhotoMap = Record<string, string[]>;

export interface MonthCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  photos?: DatePhotoMap;
  onTransitionChange?: (loading: boolean) => void;
}

// 유틸 
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfWeek(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function shiftMonth(y: number, m: number, delta: number): [number, number] {
  let nm = m + delta, ny = y;
  if (nm < 0) { ny--; nm = 11; }
  else if (nm > 11) { ny++; nm = 0; }
  return [ny, nm];
}

// 날짜 셀 
function MonthCell({ date, isCurrentMonth, isToday, isSelected, isSun, isSat, photos, onPress }: {
  date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean;
  isSun: boolean; isSat: boolean; photos: string[]; onPress: () => void;
}) {
  const hasPhoto = isCurrentMonth && photos.length > 0;
  const extra = photos.length - 1;

  return (
    <View style={styles.dateCell}>
      <TouchableOpacity
        style={[
          styles.dateDot,
          isToday && styles.todayDot,
          isSelected && styles.selectedDot,
          isSelected && isToday && styles.selectedTodayDot
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 45, left: 10, right: 10 }}
      >
        <Text style={[
          styles.dateText,
          !isCurrentMonth && styles.dimText,
          isToday && styles.todayText,
          isSelected && !isToday && styles.selectedText,
          isSelected && isToday && styles.todayText,
          isSun && isCurrentMonth && !isToday && !isSelected && styles.sunday,
          isSat && isCurrentMonth && !isToday && !isSelected && styles.saturday,
        ]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>

      {hasPhoto ? (
        <View style={styles.cellPhotoWrap}>
          <Image source={{ uri: photos[0] }} style={styles.cellPhoto} resizeMode="cover" />
          {extra > 0 && (
            <View style={styles.cellPhotoBadge}>
              <Text style={styles.cellPhotoBadgeText}>+{extra}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cellPhotoEmpty} />
      )}
    </View>
  );
}

// 한 달치 그리드 
const MonthGrid = memo(function MonthGrid({ year, month, today, selectedDate, onSelectDate, photos }: {
  year: number; month: number; today: Date; selectedDate: Date;
  onSelectDate: (d: Date) => void; photos: DatePhotoMap;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  const remaining = 7 - (cells.length % 7 === 0 ? 7 : cells.length % 7);
  for (let d = 1; d <= remaining; d++)
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });

  const weeks: { date: Date; isCurrentMonth: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={{ width: SCREEN_WIDTH, paddingHorizontal: SIDE_PADDING }}>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map(({ date, isCurrentMonth }, di) => (
            <MonthCell
              key={di}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isSameDay(date, today)}
              isSelected={isSameDay(date, selectedDate)}
              isSun={di === 0}
              isSat={di === 6}
              photos={isCurrentMonth ? (photos[dateKey(date)] ?? []) : []}
              onPress={() => onSelectDate(date)}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

// 메인 컴포넌트 
export default function MonthCalendar({ selectedDate, onSelectDate, photos = {}, onTransitionChange }: MonthCalendarProps) {
  const today = useMemo(() => new Date(), []);

  // gridYear/gridMonth: 3개 그리드 위치용 (애니메이션 완료 후 업데이트)
  const [gridYear, setGridYear] = useState(selectedDate.getFullYear());
  const [gridMonth, setGridMonth] = useState(selectedDate.getMonth());
  const gridYearRef = useRef(gridYear);
  const gridMonthRef = useRef(gridMonth);
  gridYearRef.current = gridYear;
  gridMonthRef.current = gridMonth;

  // headerYear/headerMonth: 헤더 텍스트용 (즉시 업데이트)
  const [headerYear, setHeaderYear] = useState(selectedDate.getFullYear());
  const [headerMonth, setHeaderMonth] = useState(selectedDate.getMonth());

  const [prevY, prevM] = shiftMonth(gridYear, gridMonth, -1);
  const [nextY, nextM] = shiftMonth(gridYear, gridMonth, 1);

  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const isAnimating = useRef(false);
  const [gridLoading, setGridLoading] = useState(false);
  // 애니메이션 완료 후 적용할 월/연도를 미리 저장
  const pendingYM = useRef<{ year: number; month: number } | null>(null);

  // 해당 월의 사진 URL 목록 추출
  function getMonthPhotoUrls(y: number, m: number): string[] {
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}-`;
    return Object.entries(photos)
      .filter(([key]) => key.startsWith(prefix))
      .flatMap(([, urls]) => urls);
  }

  function navigate(direction: "prev" | "next") {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const [ny, nm] = shiftMonth(gridYearRef.current, gridMonthRef.current, direction === "next" ? 1 : -1);

    // 헤더만 즉시 업데이트 (스와이프 중에는 selectedDate, loading은 건드리지 않음)
    setHeaderYear(ny);
    setHeaderMonth(nm);

    // 애니메이션 완료 후 적용할 값 저장
    pendingYM.current = { year: ny, month: nm };

    Animated.timing(translateX, {
      toValue: direction === "next" ? -SCREEN_WIDTH * 2 : 0,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        translateX.setValue(-SCREEN_WIDTH);
        isAnimating.current = false;
        pendingYM.current = null;
        return;
      }

      const pending = pendingYM.current;
      pendingYM.current = null;
      if (!pending) {
        isAnimating.current = false;
        return;
      }

      // 애니메이션 완료: 이제 selectedDate 변경 + DayContent 로딩 실행
      const clampedDay = Math.min(selectedDate.getDate(), getDaysInMonth(pending.year, pending.month));
      onSelectDate(new Date(pending.year, pending.month, clampedDay));
      onTransitionChange?.(true);

      // 그리드 업데이트
      setGridLoading(true);
      setGridYear(pending.year);
      setGridMonth(pending.month);

      requestAnimationFrame(() => {
        translateX.setValue(-SCREEN_WIDTH);
        isAnimating.current = false;

        // 새 달의 사진 prefetch → 완료되면 로딩 종료
        const urls = getMonthPhotoUrls(pending.year, pending.month);
        if (urls.length > 0) {
          Promise.all(urls.map((url) => Image.prefetch(url))).finally(() => {
            setGridLoading(false);
            onTransitionChange?.(false);
          });
        } else {
          setGridLoading(false);
          onTransitionChange?.(false);
        }
      });
    });
  }

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        if (!isAnimating.current) translateX.setValue(-SCREEN_WIDTH + gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) navigateRef.current("next");
        else if (gs.dx > SWIPE_THRESHOLD) navigateRef.current("prev");
        else Animated.spring(translateX, { toValue: -SCREEN_WIDTH, useNativeDriver: true, bounciness: 5 }).start();
      },
      onPanResponderTerminate: () => {
        translateX.stopAnimation();
        translateX.setValue(-SCREEN_WIDTH);
        setHeaderYear(gridYearRef.current);
        setHeaderMonth(gridMonthRef.current);
        isAnimating.current = false;
        pendingYM.current = null;
        onTransitionChange?.(false);
      },
    })
  ).current;

  return (
    <View>
      {/* 월 헤더 */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigate("prev")} hitSlop={12} style={styles.navBtn}>
          <MaterialIcons name="chevron-left" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{headerYear}년 {headerMonth + 1}월</Text>
        <TouchableOpacity onPress={() => navigate("next")} hitSlop={12} style={styles.navBtn}>
          <MaterialIcons name="chevron-right" size={28} color="#555" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.dayHeaderRow}>
        {DAY_LABELS.map((d, i) => (
          <Text key={d} style={[styles.dayHeaderText, i === 0 && styles.sunday, i === 6 && styles.saturday]}>
            {d}
          </Text>
        ))}
      </View>

      {/* 슬라이딩 그리드 */}
      <View style={styles.gridClip} {...panResponder.panHandlers}>
        <Animated.View style={{ flexDirection: "row", transform: [{ translateX }] }}>
          <MonthGrid year={prevY} month={prevM} today={today} selectedDate={selectedDate} onSelectDate={onSelectDate} photos={photos} />
          <MonthGrid year={gridYear} month={gridMonth} today={today} selectedDate={selectedDate} onSelectDate={onSelectDate} photos={photos} />
          <MonthGrid year={nextY} month={nextM} today={today} selectedDate={selectedDate} onSelectDate={onSelectDate} photos={photos} />
        </Animated.View>

        {gridLoading && (
          <View style={styles.gridOverlay}>
            <ActivityIndicator size="large" color="#F5A54C" />
          </View>
        )}
      </View>
    </View>
  );
}

// 스타일 
const styles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 10,
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },

  dayHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ebe8e2",
  },
  dayHeaderText: {
    width: CELL_WIDTH,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
  },

  gridClip: { overflow: "hidden", width: SCREEN_WIDTH },
  weekRow: { flexDirection: "row" },

  dateCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: "center",
    paddingTop: 5,
    paddingHorizontal: 2,
  },
  dateDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: { fontSize: 13, color: "#333", fontWeight: "500" },
  dimText: { color: "#ccc" },

  cellPhotoWrap: {
    width: CELL_WIDTH - 4,
    height: PHOTO_HEIGHT,
    borderRadius: 6,
    overflow: "hidden",
  },
  cellPhoto: { width: "100%", height: "100%" },
  cellPhotoBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.52)",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cellPhotoBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  cellPhotoEmpty: { height: PHOTO_HEIGHT },

  todayDot: { backgroundColor: "#F5A54C" },
  todayText: { color: "#fff", fontWeight: "700" },
  selectedDot: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F5A54C",
  },
  selectedTodayDot: {
    backgroundColor: "#F5A54C",
    borderWidth: 2,
    borderColor: "#fff",
  },
  selectedText: { color: "#F5A54C", fontWeight: "700" },
  sunday: { color: "#e57373" },
  saturday: { color: "#5b8dee" },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250,248,245,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
});
