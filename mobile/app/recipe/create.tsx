import { useCallback, useRef, useState } from "react";
import {
    Alert,
    findNodeHandle,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    UIManager,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import {
    IngredientItem,
    IngredientUnit,
    StepItem,
    getDefaultUnit,
    groupByCategory,
} from "@/components/recipe/create.types";
import { styles } from "@/components/recipe/create.styles";
import MediaSection from "@/components/recipe/MediaSection";
import IngredientSection from "@/components/recipe/IngredientSection";
import CategoryModal from "@/components/recipe/CategoryModal";
import StepsSection from "@/components/recipe/StepsSection";

export default function RecipeCreateScreen() {
    // 상태 
    const [imageUri, setImageUri] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [servings, setServings] = useState("");
    const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
    const [steps, setSteps] = useState<StepItem[]>([
        { id: 1, value: "" },
        { id: 2, value: "" },
        { id: 3, value: "" },
    ]);
    const [focusedInput, setFocusedInput] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    // 스크롤 핸들러 
    /** 포커스된 TextInput의 target(node handle)을 받아 자동 스크롤 */
    const handleInputFocusEvent = useCallback(
        (target: number, offset: number = 80) => {
            const scrollNode = findNodeHandle(scrollRef.current);
            if (!scrollNode) return;
            UIManager.measureLayout(
                target,
                scrollNode,
                () => { },
                (_x, y) => {
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - offset), animated: true });
                }
            );
        },
        []
    );

    // 미디어 핸들러 
    const handlePickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("권한 필요", "갤러리 접근 권한을 허용해 주세요.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setVideoLink("");
        }
    };

    const handleVideoLinkChange = (text: string) => {
        setVideoLink(text);
        if (text.trim()) setImageUri("");
    };

    // 재료 핸들러 
    const nextIngredientId = () =>
        ingredients.length > 0 ? ingredients[ingredients.length - 1].id + 1 : 1;

    const handleAddToCategory = (category: string) => {
        setIngredients((prev) => [
            ...prev,
            { id: nextIngredientId(), name: "", amount: "", unit: getDefaultUnit(category), category },
        ]);
    };

    const handleSelectCategory = (category: string) => {
        handleAddToCategory(category);
        setShowCategoryModal(false);
    };

    const handleIngredientChange = (id: number, field: "name" | "amount", text: string) => {
        setIngredients((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: text } : item))
        );
    };

    const handleIngredientUnitChange = (id: number, unit: IngredientUnit) => {
        setIngredients((prev) =>
            prev.map((item) => (item.id === id ? { ...item, unit } : item))
        );
    };

    const handleRemoveIngredient = (id: number) => {
        setIngredients((prev) => prev.filter((item) => item.id !== id));
    };

    // 설명 핸들러 
    const handleStepChange = (id: number, text: string) => {
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, value: text } : s)));
    };

    const handleAddStep = () => {
        setSteps((prev) => [
            ...prev,
            { id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1, value: "" },
        ]);
    };

    const handleRemoveStep = (id: number) => {
        if (steps.length === 1) return;
        setSteps((prev) => prev.filter((s) => s.id !== id));
    };

    // 저장
    const handleSave = () => {
        const fi = ingredients.filter((i) => i.name.trim() || i.amount.trim());
        const fs = steps.map((s) => s.value.trim()).filter(Boolean);

        let newErrors: Record<string, string> = {};

        if (!imageUri && !videoLink.trim()) newErrors.media = "사진이나 동영상을 최소 하나 등록해 주세요.";
        if (!title.trim()) newErrors.title = "레시피 제목을 입력해 주세요.";
        if (!servings || Number(servings) <= 0) newErrors.servings = "올바른 인분 수를 입력해 주세요.";
        
        if (categoryGroups.length === 0) {
            newErrors.category = "카테고리 추가를 하나 이상 해주세요.";
        } else {
            // 카테고리가 있는데 비어있는 입력창이 있는지 확인
            const invalids = ingredients.filter(i => !i.name.trim() || !i.amount.trim()).map(i => String(i.id));
            if (invalids.length > 0) {
                newErrors.ingredients = "모든 재료의 이름과 양을 입력해 주세요.";
                newErrors.invalidIngredientIds = invalids.join(",");
            }
        }

        if (fs.length === 0) newErrors.steps = "레시피 조리 단계(스탭)를 하나 이상 입력해 주세요.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            Alert.alert("필수 입력 누락", "필수 항목(빨간 글씨)을 모두 입력해 주세요.");
            return;
        }

        console.log("저장:", { imageUri, videoLink, title, subtitle, servings, fi, fs });
        Alert.alert("완료", "레시피가 성공적으로 등록/저장되었습니다!");
    };

    const categoryGroups = groupByCategory(ingredients);
    const focus = (key: string) => setFocusedInput(key);
    const blur = () => setFocusedInput("");

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                ref={scrollRef}
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Math.max(insets.bottom, 16) + 40 },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {/* 미디어 */}
                <MediaSection
                    imageUri={imageUri}
                    videoLink={videoLink}
                    focusedInput={focusedInput}
                    onPickImage={handlePickImage}
                    onVideoLinkChange={handleVideoLinkChange}
                    onFocus={focus}
                    onBlur={blur}
                    onInputFocusEvent={handleInputFocusEvent}
                    mediaError={errors.media}
                />

                <View style={styles.divider} />

                {/* 제목 / 부제목 */}
                <TextInput
                    style={[
                        styles.field,
                        focusedInput === "title" && styles.fieldActive,
                        errors.title ? { borderBottomColor: "red" } : {}
                    ]}
                    placeholder="레시피 제목"
                    placeholderTextColor="#aaa"
                    value={title}
                    onChangeText={setTitle}
                    onFocus={(e) => { focus("title"); handleInputFocusEvent(e.nativeEvent.target); }}
                    onBlur={blur}
                />
                {errors.title && <Text style={{ color: "red", fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>{errors.title}</Text>}
                <TextInput
                    style={[styles.field, focusedInput === "subtitle" && styles.fieldActive]}
                    placeholder="부제목"
                    placeholderTextColor="#aaa"
                    value={subtitle}
                    onChangeText={setSubtitle}
                    onFocus={(e) => { focus("subtitle"); handleInputFocusEvent(e.nativeEvent.target); }}
                    onBlur={blur}
                />

                <View style={styles.divider} />

                {/* 재료 */}
                <IngredientSection
                    categoryGroups={categoryGroups}
                    focusedInput={focusedInput}
                    servings={servings}
                    onServingsChange={setServings}
                    onOpenCategoryModal={() => setShowCategoryModal(true)}
                    onAddToCategory={handleAddToCategory}
                    onIngredientChange={handleIngredientChange}
                    onIngredientUnitChange={handleIngredientUnitChange}
                    onRemoveIngredient={handleRemoveIngredient}
                    onFocus={focus}
                    onBlur={blur}
                    onInputFocusEvent={handleInputFocusEvent}
                    errorMessage={errors.category || errors.ingredients}
                    servingsError={errors.servings}
                    invalidIngredientIds={errors.invalidIngredientIds ? errors.invalidIngredientIds.split(",") : []}
                />

                <View style={styles.divider} />

                {/* 설명 */}
                <StepsSection
                    steps={steps}
                    focusedInput={focusedInput}
                    onAddStep={handleAddStep}
                    onStepChange={handleStepChange}
                    onRemoveStep={handleRemoveStep}
                    onFocus={focus}
                    onBlur={blur}
                    onInputFocusEvent={handleInputFocusEvent}
                    errorMessage={errors.steps}
                />

                {/* 하단 버튼 */}
                <View style={styles.bottomButtonRow}>
                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>저장</Text>
                    </Pressable>
                </View>

                {/* 카테고리 모달 */}
                <CategoryModal
                    visible={showCategoryModal}
                    categoryGroups={categoryGroups}
                    onSelectCategory={handleSelectCategory}
                    onClose={() => setShowCategoryModal(false)}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}