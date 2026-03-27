import { StyleSheet } from "react-native";
import { ORANGE } from "./form.types";

export const styles = StyleSheet.create({
  // 전체 화면 배경
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // 저장 버튼
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: ORANGE,
    borderRadius: 8,
    marginRight: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // 가로 구분선
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ebe8e2",
  },

  // 섹션 여백
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // 섹션 제목 줄
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  // 섹션 라벨 텍스트
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.3,
  },
  // 안내 문구 (최대 2장 등)
  hint: {
    fontSize: 11,
    color: "#bbb",
  },

  // 날짜 선택 버튼
  dateSelector: {
    backgroundColor: "#fdfcfb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f5f2ed",
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  // 날짜 피커 모달 배경
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  // 바텀 시트 컨텐츠
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  // 모달 헤더 줄
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  // 모달 제목
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  // 모달 닫기(완료) 버튼
  modalCloseBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: ORANGE,
  },
  // 피커 묶음 컨테이너
  pickerContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    height: 220,
  },
  // 년/월/일 개별 컬럼
  pickerCol: {
    flex: 1,
  },
  // 피커 높이
  modalPicker: {
    height: "100%",
  },

  // 사진 가로 배치
  photoRow: {
    flexDirection: "row",
    gap: 10,
  },
  // 사진 프레임
  photoWrap: {
    width: 96,
    height: 96,
    borderRadius: 10,
    overflow: "hidden",
  },
  // 실제 이미지
  photo: {
    width: "100%",
    height: "100%",
  },
  // 사진 삭제 버튼
  photoRemoveBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  // 사진 추가 버튼 (+)
  photoAddBtn: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#f8f6f3",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  // 사진 갯수 텍스트
  photoAddCount: {
    fontSize: 11,
    color: "#bbb",
    fontWeight: "600",
  },

  // 공통 텍스트 입력창
  textInput: {
    backgroundColor: "#fdfcfb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#f5f2ed",
  },
  // 메모 제목 입력창
  memoTitleInput: {
    marginBottom: 10,
    fontWeight: "700",
    fontSize: 16,
  },
  // 메모 내용 입력창
  memoContentInput: {
    minHeight: 140,
    lineHeight: 24,
    textAlignVertical: "top",
  },

  // 추가된 레시피 아이템 줄
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  // 레시피 간 구분선
  recipeRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ebe8e2",
  },
  // 레시피 제목
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  // 레시피 부제목
  recipeSubtitle: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  // 레시피 추가 버튼 (점선)
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#f0ddc8",
    borderStyle: "dashed",
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: ORANGE,
  },
});

// 레시피 선택 모달 스타일 (별도 모달창)
export const rpStyles = StyleSheet.create({
  // 모달 전체 배경
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  // 모달 상단바
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0dcd6",
    paddingHorizontal: 4,
  },
  // 닫기 버튼 영역
  closeBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  // 모달 제목
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  // 중앙 정렬 (로딩/빈화면용)
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  // 빈 데이터 텍스트
  emptyText: {
    fontSize: 15,
    color: "#aaa",
  },
  // 리스트 내 레시피 아이템
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  // 목록용 레시피 제목
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  // 목록용 레시피 부제목
  recipeSubtitle: {
    fontSize: 13,
    color: "#888",
  },
});
