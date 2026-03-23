import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../theme/styles";

export function MiniLineChart({ data, labels, variant = "blue" }) {
  const max = Math.max(...data);
  const colors =
    variant === "purple"
      ? ["rgba(138,92,255,0.95)", "rgba(91,124,255,0.45)"]
      : ["rgba(91,124,255,0.95)", "rgba(62,200,255,0.45)"];

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartGrid}>
        {[0, 1, 2, 3].map((line) => (
          <View key={line} style={styles.chartLine} />
        ))}
      </View>
      <View style={styles.chartBarsRow}>
        {data.map((point, index) => (
          <LinearGradient
            key={`${point}-${index}`}
            colors={colors}
            style={[styles.chartBar, { height: 32 + (point / max) * 118 }]}
          />
        ))}
      </View>
      <View style={styles.chartLabels}>
        {labels.map((label) => (
          <Text key={label} style={styles.chartLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function HeatmapGrid({ values }) {
  return (
    <View>
      <View style={styles.heatmapGrid}>
        {values.map((value, index) => (
          <View
            key={`${value}-${index}`}
            style={[
              styles.heatCell,
              {
                backgroundColor:
                  value <= 1
                    ? "rgba(255,255,255,0.05)"
                    : value === 2
                      ? "rgba(91,124,255,0.18)"
                      : value === 3
                        ? "rgba(62,200,255,0.22)"
                        : value === 4
                          ? "rgba(138,92,255,0.22)"
                          : "rgba(57,217,138,0.28)",
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.heatLegendText}>Low</Text>
        <Text style={styles.heatLegendText}>High</Text>
      </View>
    </View>
  );
}
