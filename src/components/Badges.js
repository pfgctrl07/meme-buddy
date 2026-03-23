import React from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles";
import { predictionTone, theme } from "../theme/theme";

export function DataBadge({ label, value, tone }) {
  return (
    <View style={styles.dataBadge}>
      <Text style={styles.dataBadgeLabel}>{label}</Text>
      <Text style={[styles.dataBadgeValue, { color: tone }]}>{value}</Text>
    </View>
  );
}

export function PredictionPill({ label, compact = false }) {
  const tone = predictionTone(label);
  const backgroundColor =
    label === "Bearish"
      ? "rgba(255,107,122,0.18)"
      : label === "Neutral"
        ? "rgba(143,163,199,0.16)"
        : "rgba(57,217,138,0.18)";

  return (
    <View style={[styles.predictionPill, compact && styles.predictionPillCompact, { backgroundColor }]}>
      <Text style={[styles.predictionPillText, compact && styles.predictionPillTextCompact, { color: tone }]}>{label}</Text>
    </View>
  );
}

export function TrustBadge({ value }) {
  const tone = value === "Reliable" ? theme.green : theme.red;
  const backgroundColor = value === "Reliable" ? "rgba(57,217,138,0.16)" : "rgba(255,107,122,0.16)";

  return (
    <View style={[styles.predictionPill, styles.predictionPillCompact, { backgroundColor }]}>
      <Text style={[styles.predictionPillText, styles.predictionPillTextCompact, { color: tone }]}>{value}</Text>
    </View>
  );
}
