import { StyleSheet } from "react-native";
import { ORANGE, GRAY } from "./form.types";

export const styles = StyleSheet.create({
    // 레이아웃 
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20, paddingBottom: 40 },
    divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 18 },

    // 섹션 헤더 
    sectionHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
    addText: { fontSize: 13, fontWeight: "700", color: ORANGE },

    // 공통 입력 
    field: {
        borderBottomWidth: 1.5, borderBottomColor: GRAY,
        paddingVertical: 11, fontSize: 15, color: "#222", marginBottom: 12,
    },
    fieldActive: { borderBottomColor: ORANGE },

    // 미디어 
    previewBox: {
        width: "100%", height: 200, borderRadius: 14, backgroundColor: "#f6f6f6",
        justifyContent: "center", alignItems: "center", marginBottom: 12,
        overflow: "hidden", borderWidth: 1, borderColor: "#eee",
    },
    previewImage: { width: "100%", height: "100%" },
    videoPreviewBox: { paddingHorizontal: 16, alignItems: "center" },
    videoPreviewLabel: { fontSize: 14, fontWeight: "600", color: ORANGE, marginBottom: 8 },
    videoPreviewText: { fontSize: 14, color: "#444", textAlign: "center" },
    mediaPH: { fontSize: 13, color: "#bbb" },
    mediaButtonRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    mediaButton: {
        flex: 1, backgroundColor: ORANGE, paddingVertical: 12,
        borderRadius: 10, alignItems: "center",
    },
    mediaButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },

    // 재료 빈 상태 
    emptyText: { fontSize: 13, color: "#ccc", textAlign: "center", paddingVertical: 16 },

    // 카테고리 그룹 
    categoryGroup: {
        marginBottom: 14, backgroundColor: "#fafafa",
        borderRadius: 12, borderWidth: 1, borderColor: "#f0e8df", padding: 12,
    },
    categoryHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
    categoryEmoji: { fontSize: 15 },
    categoryLabel: { fontSize: 12, fontWeight: "700", color: ORANGE },

    // 재료 행 
    ingredientRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 8 },
    ingredientNameInput: {
        flex: 1, borderBottomWidth: 1.5, borderBottomColor: GRAY,
        paddingVertical: 8, fontSize: 15, color: "#222",
    },
    ingredientAmountInput: {
        width: 52, borderBottomWidth: 1.5, borderBottomColor: GRAY,
        paddingVertical: 8, fontSize: 15, color: "#222", textAlign: "center",
    },
    unitFixed: {
        width: 36, borderBottomWidth: 1.5, borderBottomColor: GRAY,
        paddingVertical: 8, alignItems: "center",
    },
    unitFixedText: { fontSize: 14, fontWeight: "600", color: "#888" },
    unitPickerWrapper: {
        width: 103, height: 38, borderBottomWidth: 1.5, borderBottomColor: GRAY,
        justifyContent: "flex-end", overflow: "visible",
    },
    unitPicker: {
        color: ORANGE,
        height: 58,
        width: "100%",
        transform: [{ translateY: 7 }],
        textAlign: "center",
    },
    deleteText: { fontSize: 16, color: "#ffb3b3", fontWeight: "700" },

    // 인라인 추가 버튼 
    inlineAddButton: {
        marginTop: 4, paddingVertical: 8, borderRadius: 8,
        borderWidth: 1.5, borderColor: "#f0e8df", borderStyle: "dashed",
        alignItems: "center",
    },
    inlineAddText: { fontSize: 12, fontWeight: "600", color: ORANGE },

    // 설명 
    stepBlock: { marginBottom: 14 },
    stepHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6,
    },
    stepTitle: { fontSize: 13, fontWeight: "700", color: "#333" },
    stepInput: {
        borderBottomWidth: 1.5, borderBottomColor: GRAY,
        paddingVertical: 10, fontSize: 14, color: "#222",
        minHeight: 60, textAlignVertical: "top",
    },

    // 하단 버튼 (취소/저장)
    bottomButtonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    cancelButton: {
        flex: 1, backgroundColor: "#f5f5f5", borderRadius: 14,
        paddingVertical: 15, alignItems: "center",
    },
    cancelButtonText: { fontSize: 15, fontWeight: "700", color: "#888" },
    saveButton: {
        flex: 1, backgroundColor: ORANGE, borderRadius: 14,
        paddingVertical: 15, alignItems: "center",
    },
    saveButtonText: { fontSize: 15, fontWeight: "700", color: "#fff" },

    // 카테고리 모달 
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    modalSheet: {
        backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, paddingBottom: 36,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: "#e0e0e0",
        alignSelf: "center", marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: "700", color: "#222", marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: "#999", marginBottom: 20 },
    categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
    categoryCard: {
        width: "47%", backgroundColor: "#fffaf5", borderRadius: 16,
        paddingVertical: 16, paddingHorizontal: 14,
        borderWidth: 1.5, borderColor: "#f0e8df", alignItems: "flex-start",
    },
    categoryCardActive: { borderColor: ORANGE, backgroundColor: "#fff5ed" },
    categoryCardEmoji: { fontSize: 24, marginBottom: 8 },
    categoryCardLabel: { fontSize: 14, fontWeight: "700", color: "#222" },
    categoryCardSub: { fontSize: 11, color: "#999", marginTop: 2 },
    categoryCardBadge: {
        position: "absolute", top: 12, right: 12,
        fontSize: 11, fontWeight: "700", color: ORANGE,
        backgroundColor: "#ffe5d0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    },
});
