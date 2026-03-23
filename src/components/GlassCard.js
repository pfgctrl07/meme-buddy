import React from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles";

export function GlassCard({ title, subtitle, children }) {
  return (
    <View style={styles.glassCard}>
      {(title || subtitle) && (
        <View style={styles.cardHeader}>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
          {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
        </View>
      )}
      {children}
    </View>
  );
}
