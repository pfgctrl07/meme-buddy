import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function AlertBanner({ event }) {
  const tone =
    event.alertTone === "danger"
      ? { bg: "rgba(255,107,122,0.15)", text: theme.red, icon: "alert-circle" }
      : event.alertTone === "warning"
        ? { bg: "rgba(255,204,102,0.16)", text: theme.yellow, icon: "warning" }
        : { bg: "rgba(57,217,138,0.16)", text: theme.green, icon: "trending-up" };

  return (
    <View style={[styles.alertBanner, { backgroundColor: tone.bg }]}>
      <Ionicons name={tone.icon} size={18} color={tone.text} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertBannerTitle, { color: tone.text }]}>{event.alertType}</Text>
        <Text style={styles.alertBannerText}>{event.name} is showing abnormal social and market behavior.</Text>
      </View>
    </View>
  );
}

export function AlertCard({ alert }) {
  const color =
    alert.urgency === "critical" ? theme.red : alert.urgency === "medium" ? theme.yellow : theme.green;

  return (
    <View style={styles.alertCard}>
      <View style={[styles.alertMarker, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.rowSpread}>
          <Text style={styles.alertCardTitle}>{alert.title}</Text>
          <Text style={[styles.alertType, { color }]}>{alert.type}</Text>
        </View>
        <Text style={styles.alertCardDetail}>{alert.detail}</Text>
        <Text style={styles.alertCardTime}>{alert.timestamp}</Text>
      </View>
    </View>
  );
}
