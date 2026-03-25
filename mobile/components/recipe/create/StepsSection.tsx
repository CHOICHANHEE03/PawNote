import { Pressable, Text, TextInput, View } from "react-native";
import { StepItem } from "./create.types";
import { styles } from "./create.styles";

interface Props {
    steps: StepItem[];
    focusedInput: string;
    onAddStep: () => void;
    onStepChange: (id: number, text: string) => void;
    onRemoveStep: (id: number) => void;
    onFocus: (key: string) => void;
    onBlur: () => void;
    onInputFocusEvent: (target: number, offset?: number) => void;
    errorMessage?: string;
}

export default function StepsSection({
    steps,
    focusedInput,
    onAddStep,
    onStepChange,
    onRemoveStep,
    onFocus,
    onBlur,
    onInputFocusEvent,
    errorMessage,
}: Props) {
    return (
        <>
            {/* 섹션 헤더 */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>설명</Text>
                <Pressable onPress={onAddStep}>
                    <Text style={styles.addText}>+ 스텝 추가</Text>
                </Pressable>
            </View>
            {errorMessage && <Text style={{ color: "red", fontSize: 12, marginTop: -4, marginBottom: 8, marginLeft: 4 }}>{errorMessage}</Text>}

            {/* 스텝 목록 */}
            {steps.map((step, index) => (
                <View key={step.id} style={styles.stepBlock}>
                    <View style={styles.stepHeader}>
                        <Text style={styles.stepTitle}>STEP {index + 1}</Text>
                        {steps.length > 1 && (
                            <Pressable onPress={() => onRemoveStep(step.id)}>
                                <Text style={styles.deleteText}>✕</Text>
                            </Pressable>
                        )}
                    </View>
                    <TextInput
                        style={[
                            styles.stepInput,
                            focusedInput === `step-${step.id}` && styles.fieldActive,
                        ]}
                        placeholder={`STEP ${index + 1} 설명을 입력하세요`}
                        placeholderTextColor="#aaa"
                        value={step.value}
                        onChangeText={(t) => onStepChange(step.id, t)}
                        onFocus={(e) => { onFocus(`step-${step.id}`); onInputFocusEvent(e.nativeEvent.target, 50); }}
                        onBlur={onBlur}
                        multiline
                    />
                </View>
            ))}
        </>
    );
}
