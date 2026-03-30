import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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
import { router, useLocalSearchParams } from "expo-router";
import { useRecipeDetail } from "@/hooks/recipe/useRecipeDetail";
import { useUpdateRecipe } from "@/hooks/recipe/useUpdateRecipe";
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
import MenuButton from "@/components/common/MenuButton";

const ORANGE = "#F5A54C";

export default function RecipeEditScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const recipeId = Number(id);
    const { data: recipe, isLoading } = useRecipeDetail(recipeId);

    const [imageUri, setImageUri] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [servings, setServings] = useState("");
    const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
    const [steps, setSteps] = useState<StepItem[]>([{ id: 1, value: "" }]);
    const [focusedInput, setFocusedInput] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [invalidIngredientIds, setInvalidIngredientIds] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const { mutate, isPending } = useUpdateRecipe();

    // 기존 데이터로 폼 초기화
    useEffect(() => {
        if (!recipe || initialized) return;
        setTitle(recipe.title);
        setSubtitle(recipe.subtitle ?? "");
        setServings(String(recipe.servings));
        setVideoLink(recipe.videoLink ?? "");
        setImageUri(recipe.imageUrl ?? "");
        setIngredients(
            recipe.ingredients.map((ing, i) => ({
                id: i + 1,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit as IngredientUnit,
                category: ing.category,
            }))
        );
        setSteps(
            recipe.steps
                .slice()
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((s) => ({ id: s.stepOrder, value: s.content }))
        );
        setInitialized(true);
    }, [recipe, initialized]);

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

    const handlePickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("권한 필요", "갤러리 접근 권한을 허용해 주세요.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
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

    const handleUpdateRecipe = () => {
        const newErrors: Record<string, string> = {};
        const newInvalidIngredientIds: string[] = [];

        const trimmedTitle = title.trim();
        const trimmedSubtitle = subtitle.trim();
        const trimmedVideoLink = videoLink.trim();

        if (!trimmedTitle) newErrors.title = "레시피 제목을 입력해주세요.";
        if (!servings.trim()) newErrors.servings = "인분을 입력해주세요.";
        if (ingredients.length === 0) newErrors.ingredients = "재료를 1개 이상 입력해주세요.";

        ingredients.forEach((item) => {
            if (!item.name.trim() || !item.amount.trim())
                newInvalidIngredientIds.push(String(item.id));
        });

        const validSteps = steps.filter((item) => item.value.trim() !== "");
        if (validSteps.length === 0) newErrors.steps = "조리 순서를 1개 이상 입력해주세요.";

        if (!imageUri && !trimmedVideoLink)
            newErrors.media = "이미지 또는 영상 링크 중 하나를 등록해주세요.";

        setErrors(newErrors);
        setInvalidIngredientIds(newInvalidIngredientIds);

        if (Object.keys(newErrors).length > 0 || newInvalidIngredientIds.length > 0) return;

        // 기존 서버 이미지는 재업로드하지 않음
        const isNewImage = imageUri && !imageUri.startsWith("http");

        mutate(
            {
                id: recipeId,
                payload: {
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
                },
                imageUri: isNewImage ? imageUri : undefined,
            },
            {
                onSuccess: () => {
                    Alert.alert("완료", "레시피가 수정되었습니다!", [
                        { text: "확인", onPress: () => router.back() },
                    ]);
                },
                onError: (error: any) => {
                    const serverMessage =
                        error?.response?.data?.message ||
                        (typeof error?.response?.data === "string" ? error.response.data : undefined);
                    Alert.alert("수정 실패", serverMessage || error.message || "레시피 수정에 실패했습니다.");
                },
            }
        );
    };

    if (isLoading || !initialized) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#faf8f5" }}>
                <ActivityIndicator size="large" color={ORANGE} />
            </View>
        );
    }

    const categoryGroups = groupByCategory(ingredients);
    const focus = (key: string) => setFocusedInput(key);
    const blur = () => setFocusedInput("");

    return (
        <View style={{ flex: 1 }}>
            <BackHeader right={<MenuButton recipeId={recipeId} showEdit={false} />} />
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

                    <TextInput
                        style={[
                            styles.field,
                            focusedInput === "title" && styles.fieldActive,
                            errors.title ? { borderBottomColor: "red" } : {},
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
                    {errors.title && (
                        <Text style={{ color: "red", fontSize: 12, marginTop: -8, marginBottom: 8, marginLeft: 4 }}>
                            {errors.title}
                        </Text>
                    )}
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
                            onPress={handleUpdateRecipe}
                            disabled={isPending}
                        >
                            <Text style={styles.saveButtonText}>
                                {isPending ? "수정 중..." : "수정"}
                            </Text>
                        </Pressable>
                    </View>

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
