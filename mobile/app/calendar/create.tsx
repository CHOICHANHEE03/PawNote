import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BackHeader from "@/components/header/BackHeader";
import { useCreateCalendarEntry } from "@/hooks/calendar/useCreateCalendarEntry";
import { useUpdateCalendarEntry } from "@/hooks/calendar/useUpdateCalendarEntry";
import { useCalendarDayEntry } from "@/hooks/calendar/useCalendarDayEntry";
import { useRecipeList } from "@/hooks/recipe/useRecipeList";
import {
  ORANGE,
  MAX_PHOTOS,
  SelectedRecipe,
  parseDateParam,
  dateToKey,
  getDaysInMonth,
} from "@/components/calendar/form/form.types";
import { styles } from "@/components/calendar/form/form.styles";
import DatePickerModal from "@/components/calendar/form/DatePickerModal";
import RecipePickerModal from "@/components/calendar/form/RecipePickerModal";

export default function CalendarCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date: dateParam, id: idParam } = useLocalSearchParams<{ date: string; id: string }>();

  const isEdit = !!idParam;
  const entryId = isEdit ? Number(idParam) : undefined;
  const initDate = parseDateParam(dateParam);

  const [year, setYear] = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth());
  const [day, setDay] = useState(initDate.getDate());

  const [photos, setPhotos] = useState<string[]>([]);
  const [existingUrlSet, setExistingUrlSet] = useState<Set<string>>(new Set());
  const [companion, setCompanion] = useState("");
  const [recipes, setRecipes] = useState<SelectedRecipe[]>([]);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(!isEdit);

  const { mutate: createMutate, isPending: isCreating } = useCreateCalendarEntry();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateCalendarEntry();
  const isPending = isCreating || isUpdating;

  const selectedDate = new Date(year, month, day);
  const { data: dayEntries = [] } = useCalendarDayEntry(selectedDate);
  const { data: recipeList = [] } = useRecipeList();

  // 수정 모드: 기존 데이터로 초기화
  useEffect(() => {
    if (!isEdit || initialized) return;
    const raw = dayEntries.find((e) => e.id === entryId) ?? dayEntries[0];
    if (!raw) return;

    setPhotos(raw.imageUrls);
    setExistingUrlSet(new Set(raw.imageUrls));
    setCompanion(raw.companion ?? "");
    setRecipes(
      raw.recipeIds.map((id) => {
        const found = recipeList.find((r) => r.id === id);
        return { id, title: found?.title ?? String(id), subtitle: found?.subtitle };
      })
    );
    setMemoTitle(raw.memoTitle ?? "");
    setMemoContent(raw.memoContent ?? "");
    setInitialized(true);
  }, [dayEntries, recipeList, isEdit, initialized, entryId]);

  // 수정: 날짜를 변경했을 때만 새 날짜에 기록이 있으면 중복/ 같은 날짜 허용
  const currentDateKey = dateToKey(year, month, day);
  const isDuplicate = isEdit
    ? currentDateKey !== dateParam && dayEntries.length > 0
    : dayEntries.length > 0;

  const handleMonthChange = (m: number) => {
    setMonth(m);
    const max = getDaysInMonth(year, m);
    if (day > max) setDay(max);
  };

  const handleYearChange = (y: number) => {
    setYear(y);
    const max = getDaysInMonth(y, month);
    if (day > max) setDay(max);
  };

  const handleAddPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("권한 필요", "갤러리 접근 권한을 허용해 주세요.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
      if (errors.photos) setErrors((prev) => ({ ...prev, photos: "" }));
    }
  };

  const handleSave = () => {
    if (isDuplicate) {
      Alert.alert("중복 기록", "해당 날짜에 이미 기록이 있습니다.\n날짜를 변경하거나 기존 기록을 확인해주세요.");
      return;
    }
    const newErrors: Record<string, string> = {};
    if (photos.length === 0) newErrors.photos = "사진을 1장 이상 추가해주세요.";
    if (!companion.trim()) newErrors.companion = "함께한 사람을 입력해주세요.";
    if (recipes.length === 0) newErrors.recipes = "레시피를 1개 이상 추가해주세요.";
    if (!memoTitle.trim()) newErrors.memoTitle = "메모 제목을 입력해주세요.";
    if (!memoContent.trim()) newErrors.memoContent = "메모 내용을 입력해주세요.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (isEdit && entryId !== undefined) {
      const existingImageUrls = photos.filter((p) => existingUrlSet.has(p));
      const newImageUris = photos.filter((p) => !existingUrlSet.has(p));
      updateMutate(
        {
          id: entryId,
          payload: {
            date: currentDateKey,
            companion: companion.trim() || undefined,
            recipeIds: recipes.map((r) => r.id),
            memoTitle: memoTitle.trim() || undefined,
            memoContent: memoContent.trim() || undefined,
          },
          existingImageUrls,
          newImageUris,
        },
        {
          onSuccess: () => {
            Alert.alert("완료", "기록이 수정되었습니다!", [
              { text: "확인", onPress: () => router.back() },
            ]);
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.message || error.message || "수정에 실패했습니다.";
            Alert.alert("수정 실패", msg);
          },
        }
      );
    } else {
      createMutate(
        {
          payload: {
            date: dateToKey(year, month, day),
            companion: companion.trim() || undefined,
            recipeIds: recipes.map((r) => r.id),
            memoTitle: memoTitle.trim() || undefined,
            memoContent: memoContent.trim() || undefined,
          },
          imageUris: photos,
        },
        {
          onSuccess: () => {
            Alert.alert("완료", "캘린더에 기록이 저장되었습니다!", [
              { text: "확인", onPress: () => router.back() },
            ]);
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.message || error.message || "저장에 실패했습니다.";
            Alert.alert("저장 실패", msg);
          },
        }
      );
    }
  };

  return (
    <View style={styles.screen}>
      <BackHeader
        right={
          <TouchableOpacity
            style={[styles.saveBtn, (isPending || isDuplicate) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={isPending}
          >
            <Text style={styles.saveBtnText}>
              {isPending ? (isEdit ? "수정 중..." : "저장 중...") : isEdit ? "수정" : "저장"}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 40, paddingTop: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 날짜 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="calendar-today" size={15} color={ORANGE} />
              <Text style={styles.sectionLabel}>기록할 날짜</Text>
            </View>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateSelectorText}>
                {year}년 {month + 1}월 {day}일
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#bbb" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 사진 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="photo-camera" size={15} color={ORANGE} />
              <Text style={styles.sectionLabel}>사진</Text>
              <Text style={styles.hint}>최대 {MAX_PHOTOS}장</Text>
            </View>
            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    hitSlop={6}
                  >
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < MAX_PHOTOS && (
                <TouchableOpacity
                  style={[styles.photoAddBtn, errors.photos ? { borderWidth: 1.5, borderColor: "red" } : {}]}
                  onPress={handleAddPhoto}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add-photo-alternate" size={28} color={errors.photos ? "red" : "#ccc"} />
                  <Text style={styles.photoAddCount}>{photos.length}/{MAX_PHOTOS}</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.photos ? (
              <Text style={{ color: "red", fontSize: 12, marginTop: 6, marginLeft: 4 }}>{errors.photos}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* 누구랑 함께*/}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="people" size={15} color={ORANGE} />
              <Text style={styles.sectionLabel}>누구랑 함께</Text>
            </View>
            <TextInput
              style={[styles.textInput, errors.companion ? { borderColor: "red" } : {}]}
              placeholder="누구랑 함께 요리했나요? (예: 가족, 혼자)"
              placeholderTextColor="#ccc"
              value={companion}
              onChangeText={(text) => {
                setCompanion(text);
                if (errors.companion) setErrors((prev) => ({ ...prev, companion: "" }));
              }}
            />
            {errors.companion ? (
              <Text style={{ color: "red", fontSize: 12, marginTop: 6, marginLeft: 4 }}>{errors.companion}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* 레시피 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant-menu" size={15} color={ORANGE} />
              <Text style={styles.sectionLabel}>레시피</Text>
            </View>
            {recipes.map((r, i) => (
              <View key={r.id} style={[styles.recipeRow, i > 0 && styles.recipeRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>{r.title}</Text>
                  {r.subtitle ? (
                    <Text style={styles.recipeSubtitle} numberOfLines={1}>{r.subtitle}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => setRecipes((prev) => prev.filter((x) => x.id !== r.id))}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={18} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[
                styles.addBtn,
                recipes.length > 0 && { marginTop: 10 },
                errors.recipes ? { borderColor: "red" } : {},
              ]}
              onPress={() => setShowRecipePicker(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={17} color={errors.recipes ? "red" : ORANGE} />
              <Text style={[styles.addBtnText, errors.recipes ? { color: "red" } : {}]}>레시피 추가</Text>
            </TouchableOpacity>
            {errors.recipes ? (
              <Text style={{ color: "red", fontSize: 12, marginTop: 6, marginLeft: 4 }}>{errors.recipes}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* 메모 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notes" size={15} color={ORANGE} />
              <Text style={styles.sectionLabel}>메모</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.memoTitleInput, errors.memoTitle ? { borderColor: "red" } : {}]}
              placeholder="제목"
              placeholderTextColor="#ccc"
              value={memoTitle}
              onChangeText={(text) => {
                setMemoTitle(text);
                if (errors.memoTitle) setErrors((prev) => ({ ...prev, memoTitle: "" }));
              }}
            />
            {errors.memoTitle ? (
              <Text style={{ color: "red", fontSize: 12, marginTop: -6, marginBottom: 6, marginLeft: 4 }}>
                {errors.memoTitle}
              </Text>
            ) : null}
            <TextInput
              style={[styles.textInput, styles.memoContentInput, errors.memoContent ? { borderColor: "red" } : {}]}
              placeholder="오늘의 요리 기록을 남겨보세요."
              placeholderTextColor="#ccc"
              value={memoContent}
              onChangeText={(text) => {
                setMemoContent(text);
                if (errors.memoContent) setErrors((prev) => ({ ...prev, memoContent: "" }));
              }}
              multiline
              textAlignVertical="top"
            />
            {errors.memoContent ? (
              <Text style={{ color: "red", fontSize: 12, marginTop: 6, marginLeft: 4 }}>{errors.memoContent}</Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={showDatePicker}
        year={year}
        month={month}
        day={day}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onDayChange={setDay}
        onClose={() => setShowDatePicker(false)}
      />

      <RecipePickerModal
        visible={showRecipePicker}
        selectedIds={recipes.map((r) => r.id)}
        onSelect={(r) => {
          setRecipes((prev) => (prev.find((x) => x.id === r.id) ? prev : [...prev, r]));
          if (errors.recipes) setErrors((prev) => ({ ...prev, recipes: "" }));
        }}
        onClose={() => setShowRecipePicker(false)}
      />
    </View>
  );
}
