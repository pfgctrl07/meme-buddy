import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function InfoTile({ icon, title, body }) {
  return (
    <View style={styles.infoTile}>
      <View style={styles.infoIconBubble}>
        <Ionicons name={icon} size={18} color={theme.cyan} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}
