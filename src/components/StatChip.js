import React from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles";

export function StatChip({ label, value }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipLabel}>{label}</Text>
      <Text style={styles.statChipValue}>{value}</Text>
    </View>
  );
}
