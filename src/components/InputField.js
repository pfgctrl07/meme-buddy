import React from "react";
import { Text, TextInput, View } from "react-native";
import { styles } from "../theme/styles";

export function InputField({
  label,
  placeholder,
  multiline = false,
  value,
  onChangeText,
  autoCapitalize = "none",
  editable = true,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#6E7F9D"
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}
