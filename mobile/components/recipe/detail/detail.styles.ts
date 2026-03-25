import { Dimensions, StyleSheet } from "react-native";

export const { width } = Dimensions.get("window");
export const ORANGE = "#F5A54C";
export const VIDEO_HEIGHT = width * 0.5625;

export const styles = StyleSheet.create({
  // 루트 / 스크롤
  root: { flex: 1, backgroundColor: "#faf8f5" },
  scroll: { paddingBottom: 40 },

  // 미디어
  videoWrapper: { width, height: VIDEO_HEIGHT, backgroundColor: "#000" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  hero: { width, height: width * 0.56 },
  heroPlaceholder: {
    backgroundColor: "#f0ede8",
    justifyContent: "center",
    alignItems: "center",
  },

  // 제목
  titleSection: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", lineHeight: 32 },
  subtitle: { marginTop: 10, fontSize: 14, color: "#888", lineHeight: 22 },

  // 구분선
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#d0c8be",
    marginHorizontal: 20,
    marginVertical: 4,
  },

  // 섹션 공통
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1a1a1a" },

  // 조리 순서 제목 (첫 스텝과 간격)
  stepsSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 24,
  },

  // 인분 선택
  servingsRow: { flexDirection: "row", gap: 6 },
  servingsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0c8be",
    backgroundColor: "#faf8f5",
  },
  servingsBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  servingsBtnText: { fontSize: 12, color: "#888", fontWeight: "600" },
  servingsBtnTextActive: { color: "#fff" },
  customInput: {
    width: 54,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ORANGE,
    fontSize: 12,
    color: "#1a1a1a",
    textAlign: "center",
  },

  // 재료
  categoryBlock: { marginBottom: 20 },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e8e4df",
  },
  ingredientName: { fontSize: 14, color: "#333", flexShrink: 1, marginRight: 8 },
  ingredientAmount: { fontSize: 14, color: "#888", fontWeight: "500" },

  // 조리 순서 타임라인
  stepItem: { flexDirection: "row" },
  stepTimeline: { alignItems: "center", width: 28, marginRight: 16 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepBadgeText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stepConnector: {
    width: 0,
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#c8c0b8",
    marginTop: 6,
  },
  stepBody: { flex: 1, paddingBottom: 44, paddingTop: 4 },
  stepContent: { flex: 1, fontSize: 14, color: "#333", lineHeight: 22 },

  // 상태 화면
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf8f5",
    gap: 12,
  },
  loadingText: { color: "#aaa", fontSize: 13 },
  errorText: { fontSize: 15, color: "#e57373", fontWeight: "600" },
  retryBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
