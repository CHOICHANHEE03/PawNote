import React from "react";
import { Text, View } from "react-native";
import { styles } from "./detail.styles";
import { RecipeDetail } from "./detail.types";

interface Props {
  steps: RecipeDetail["steps"];
}

export default function StepsSection({ steps }: Props) {
  const sorted = steps.slice().sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <View style={styles.section}>
      <Text style={styles.stepsSectionTitle}>👨‍🍳 조리 순서</Text>

      {sorted.map((step, index) => {
        const isLast = index === sorted.length - 1;
        return (
          <View key={step.stepOrder} style={styles.stepItem}>
            {/* 왼쪽: 번호 + 점선 */}
            <View style={styles.stepTimeline}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.stepOrder}</Text>
              </View>
              {!isLast && <View style={styles.stepConnector} />}
            </View>
            {/* 오른쪽: 내용 */}
            <View style={[styles.stepBody, isLast && { paddingBottom: 0 }]}>
              <Text style={styles.stepContent}>{step.content}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
