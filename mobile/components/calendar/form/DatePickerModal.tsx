import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { YEARS, MONTHS, getDaysInMonth } from "./form.types";
import { styles } from "./form.styles";

interface DatePickerModalProps {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onDayChange: (d: number) => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible, year, month, day, onYearChange, onMonthChange, onDayChange, onClose,
}: DatePickerModalProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>날짜 선택</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>완료</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerCol}>
              <Picker selectedValue={year} onValueChange={onYearChange} style={styles.modalPicker}>
                {YEARS.map((y) => <Picker.Item key={y} label={`${y}년`} value={y} />)}
              </Picker>
            </View>
            <View style={styles.pickerCol}>
              <Picker selectedValue={month} onValueChange={onMonthChange} style={styles.modalPicker}>
                {MONTHS.map((m) => <Picker.Item key={m} label={`${m + 1}월`} value={m} />)}
              </Picker>
            </View>
            <View style={styles.pickerCol}>
              <Picker selectedValue={day} onValueChange={onDayChange} style={styles.modalPicker}>
                {days.map((d) => <Picker.Item key={d} label={`${d}일`} value={d} />)}
              </Picker>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
