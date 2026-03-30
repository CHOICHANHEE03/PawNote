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
import { useCreateRecipe } from "@/hooks/recipe/useCreateRecipe";
import BackHeader from "@/components/header/BackHeader";

import {
    IngredientItem,
    IngredientUnit,
    StepItem,
    getDefaultUnit,
    groupByCategory,
} from "@/components/recipe/form/form.types";
import { styles } from "@/components/recipe/form/form.styles";
import MediaSection from "@/components/recipe/form/MediaSection";
import IngredientSection from "@/components/recipe/form/IngredientSection";
import CategoryModal from "@/components/recipe/form/CategoryModal";
import StepsSection from "@/components/recipe/form/StepsSection";

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
    const [invalidIngredientIds, setInvalidIngredientIds] = useState<string[]>([]);

    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

    const { mutate, isPending } = useCreateRecipe();

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
        setInvalidIngredientIds((prev) => prev.filter((itemId) => itemId !== String(id)));
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
    const handleSaveRecipe = () => {
        const newErrors: Record<string, string> = {};
        const newInvalidIngredientIds: string[] = [];

        const trimmedTitle = title.trim();
        const trimmedSubtitle = subtitle.trim();
        const trimmedVideoLink = videoLink.trim();

        if (!trimmedTitle) {
            newErrors.title = "레시피 제목을 입력해주세요.";
        }

        if (!servings.trim()) {
            newErrors.servings = "인분을 입력해주세요.";
        }

        if (ingredients.length === 0) {
            newErrors.ingredients = "재료를 1개 이상 입력해주세요.";
        }

        ingredients.forEach((item) => {
            if (!item.name.trim() || !item.amount.trim()) {
                newInvalidIngredientIds.push(String(item.id));
            }
        });

        const validSteps = steps.filter((item) => item.value.trim() !== "");
        if (validSteps.length === 0) {
            newErrors.steps = "조리 순서를 1개 이상 입력해주세요.";
        }

        if (imageUri && trimmedVideoLink) {
            newErrors.media = "이미지 또는 영상 링크 중 하나만 등록할 수 있습니다.";
        }

        if (!imageUri && !trimmedVideoLink) {
            newErrors.media = "이미지 또는 영상 링크 중 하나를 등록해주세요.";
        }

        setErrors(newErrors);
        setInvalidIngredientIds(newInvalidIngredientIds);

        if (Object.keys(newErrors).length > 0 || newInvalidIngredientIds.length > 0) {
            return;
        }

        const payload = {
            title: trimmedTitle,
            subtitle: trimmedSubtitle,
            servings: Number(servings) || 0,
            videoLink: trimmedVideoLink || undefined,
            ingredients: ingredients.map((item) => ({
                name: item.name.trim(),
                amount: item.amount.trim(),
                unit: item.unit,
                category: item.category.trim(),
            })),
            steps: validSteps.map((item, index) => ({
                stepOrder: index + 1,
                content: item.value.trim(),
            })),
        };

        mutate({
            payload,
            imageUri: imageUri || undefined,
        }, {
            onSuccess: () => {
                Alert.alert("완료", "레시피가 성공적으로 등록되었습니다!", [
                    { text: "확인", onPress: () => router.back() }
                ]);
            },
            onError: (error: any) => {
                console.log("전체 에러:", error);
                console.log("응답 코드:", error?.response?.status);
                console.log("응답 데이터:", error?.response?.data);
                console.log("에러 메시지:", error?.message);

                const serverMessage = error?.response?.data?.message || (typeof error?.response?.data === 'string' ? error.response.data : undefined);

                Alert.alert(
                    "레시피 저장 실패",
                    serverMessage || error.message || "레시피 저장에 실패했습니다."
                );
            }
        });
    };

    const categoryGroups = groupByCategory(ingredients);
    const focus = (key: string) => setFocusedInput(key);
    const blur = () => setFocusedInput("");

    return (
        <View style={{ flex: 1 }}>
            <BackHeader />
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
                        onFocus={(e) => {
                            focus("title");
                            handleInputFocusEvent(e.nativeEvent.target);
                            setErrors((prev) => ({ ...prev, title: "" }));
                        }}
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
                        onServingsChange={(text) => {
                            setServings(text);
                            setErrors((prev) => ({ ...prev, servings: "" }));
                        }}
                        onOpenCategoryModal={() => setShowCategoryModal(true)}
                        onAddToCategory={handleAddToCategory}
                        onIngredientChange={(id, field, text) => {
                            handleIngredientChange(id, field, text);
                            setInvalidIngredientIds((prev) => prev.filter((itemId) => itemId !== String(id)));
                            setErrors((prev) => ({ ...prev, ingredients: "" }));
                        }}
                        onIngredientUnitChange={handleIngredientUnitChange}
                        onRemoveIngredient={handleRemoveIngredient}
                        onFocus={focus}
                        onBlur={blur}
                        onInputFocusEvent={handleInputFocusEvent}
                        errorMessage={errors.ingredients || errors.category}
                        servingsError={errors.servings}
                        invalidIngredientIds={invalidIngredientIds}
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
                    <View style={[styles.bottomButtonRow, isPending && { opacity: 0.7 }]}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={isPending}
                        >
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </Pressable>
                        <Pressable
                            style={styles.saveButton}
                            onPress={handleSaveRecipe}
                            disabled={isPending}
                        >
                            <Text style={styles.saveButtonText}>
                                {isPending ? "저장 중..." : "저장"}
                            </Text>
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
        </View>
    );
}