import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../theme/styles";

export function GradientCard({ colors, children }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
      {children}
    </LinearGradient>
  );
}
