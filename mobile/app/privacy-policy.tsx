import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: `가. 소셜 로그인(구글, 네이버, 카카오) 이용 시
• 필수: 소셜 계정 식별값, 로그인 제공자 정보(provider)
• 선택: 이름 또는 닉네임, 이메일

나. 서비스 이용 과정에서 자동 생성되는 정보
• 서비스 이용 기록(레시피, 캘린더, 장보기 등록 정보), 접속 일시`,
  },
  {
    title: "2. 개인정보의 처리 목적",
    content: `• 회원 식별 및 로그인 기능 제공
• 레시피, 캘린더, 장보기 등 서비스 기능 제공
• 서비스 이용자 관리 및 고객 문의 대응
• 서비스 개선 및 오류 대응, 부정 이용 방지`,
  },
  {
    title: "3. 개인정보의 보유 및 이용기간",
    content: `• 회원 정보: 회원 탈퇴 시까지
• 서비스 이용 기록(레시피, 캘린더, 장보기): 회원 탈퇴 또는 이용 목적 달성 시까지

관련 법령에 따라 보관이 필요한 경우 해당 법령이 정한 기간까지 보관합니다.`,
  },
  {
    title: "4. 개인정보의 제3자 제공",
    content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
다만, 이용자의 동의가 있거나 법령에 특별한 규정이 있는 경우에는 예외로 합니다.`,
  },
  {
    title: "5. 개인정보 처리의 위탁",
    content: `서비스 운영을 위해 다음 업무를 외부 업체에 위탁할 수 있습니다.
• 소셜 로그인 연동: Google LLC, Naver Corp., Kakao Corp.

실제 위탁 관계 발생 시 앱 공지를 통해 안내합니다.`,
  },
  {
    title: "6. 이용자의 권리와 행사 방법",
    content: `이용자는 언제든지 자신의 개인정보에 대해 조회, 수정, 삭제, 처리정지 요청을 할 수 있습니다.
회원 탈퇴 요청 시 관련 법령상 보관 의무가 없는 한 지체 없이 파기합니다.
앱 내 [프로필 → 회원탈퇴] 메뉴를 통해 언제든지 탈퇴할 수 있습니다.`,
  },
  {
    title: "7. 개인정보의 파기 절차 및 방법",
    content: `개인정보 보유기간 경과 또는 처리 목적 달성 시 지체 없이 파기합니다.
전자적 파일은 복구·재생이 불가능한 방법으로 안전하게 삭제합니다.`,
  },
  {
    title: "8. 개인정보의 안전성 확보조치",
    content: `• 접근 권한 관리 및 서버 접근 통제
• 인증 토큰 기반 보안 접근(JWT)
• 기기 내 토큰 암호화 저장(SecureStore)
• 보안 업데이트 및 로그 관리`,
  },
  {
    title: "9. 문의처",
    content: `개인정보 관련 문의는 아래로 연락해 주시기 바랍니다.
• 이메일: pawnote.contact@gmail.com
• 담당자: 최찬희`,
  },
  {
    title: "10. 처리방침의 변경",
    content: `본 개인정보 처리방침은 2026년 3월 28일부터 적용됩니다.
내용이 변경될 경우 앱 또는 공지사항을 통해 안내합니다.`,
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          PawNote(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며,
          「개인정보 보호법」 등 관련 법령을 준수합니다.{"\n"}
          본 방침을 통해 제공한 개인정보의 이용 목적과 보호 조치를 안내합니다.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  intro: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
  },
});
