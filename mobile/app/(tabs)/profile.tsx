import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// 임시 더미 데이터 
const MOCK_USER = {
  name: "김김김",
  provider: "google" as "google" | "kakao" | "naver",
};

const PROVIDER_LABEL: Record<string, { label: string }> = {
  google: { label: "Google" },
  kakao: { label: "카카오" },
  naver: { label: "네이버" },
};

type MenuRow = {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

type MenuSection = {
  title: string;
  rows: MenuRow[];
};

export default function profileScreen() {
  const user = MOCK_USER;
  const provider = PROVIDER_LABEL[user.provider];

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: () => { } },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert(
      "회원탈퇴",
      "정말 탈퇴하시겠어요?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "탈퇴하기", style: "destructive", onPress: () => { } },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: "앱 정보",
      rows: [
        { icon: "info-outline", label: "버전 정보", onPress: () => { } },
        { icon: "privacy-tip", label: "개인정보 처리방침", onPress: () => { } },
      ],
    },
    {
      title: "회원 관리",
      rows: [
        { icon: "logout", label: "로그아웃", onPress: handleLogout },
        { icon: "person-remove", label: "회원탈퇴", onPress: handleWithdraw, danger: true },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 프로필 영역 */}
      <View style={styles.profileArea}>
        <View style={styles.avatarWrapper}>
          <MaterialIcons name="person" size={48} color="#c8bfb0" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.providerBadge}>
          <View style={styles.providerDot} />
          <Text style={styles.providerText}>
            {provider.label}로 로그인
          </Text>
        </View>
      </View>

      {/* 메뉴 섹션들 */}
      {menuSections.map((section, si) => (
        <View key={si} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.rows.map((row, ri) => (
              <React.Fragment key={ri}>
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={row.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, row.danger && styles.menuIconDanger]}>
                    <MaterialIcons
                      name={row.icon as any}
                      size={20}
                      color={row.danger ? "#e57373" : "#8a7e72"}
                    />
                  </View>
                  <Text style={[styles.menuLabel, row.danger && styles.menuLabelDanger]}>
                    {row.label}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
                {ri < section.rows.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  content: {
    paddingBottom: 40,
  },

  // 프로필 
  profileArea: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#f0ece5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#F5A54C55",
    backgroundColor: "#fff",
  },
  providerDot: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: "#F5A54C",
  },
  providerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F5A54C",
  },

  // 메뉴 섹션 
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aaa",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f2ee",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: {
    backgroundColor: "#fdecea",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  menuLabelDanger: {
    color: "#e57373",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#f0ece5",
    marginLeft: 64,
  },
});
