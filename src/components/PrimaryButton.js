import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function PrimaryButton({ label, onPress, icon }) {
  return (
    <Pressable onPress={onPress} style={styles.buttonShadow}>
      <LinearGradient
        colors={[theme.blue, theme.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButton}
      >
        <Ionicons name={icon} size={18} color={theme.text} />
        <Text style={styles.primaryButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
