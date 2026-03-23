import React from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles";

export function StatCard({ label, value, detail, icon }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDetail}>{detail}</Text>
    </View>
  );
}

export function MiniMetric({ label, value, tone }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricLabel}>{label}</Text>
      <Text style={[styles.miniMetricValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}
