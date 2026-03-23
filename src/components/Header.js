import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function Header({ activeTab, alertsCount }) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>MEME BUDDY</Text>
        <Text style={styles.headerTitle}>
          {activeTab === "discover"
            ? "Trend discovery radar"
            : activeTab === "alerts"
              ? "AI alerts and signals"
              : "Trend intelligence for memes"}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.alertBell}>
          <Ionicons name="notifications" size={18} color={theme.text} />
          <View style={styles.alertCount}>
            <Text style={styles.alertCountText}>{alertsCount}</Text>
          </View>
        </View>
        <LinearGradient
          colors={["rgba(91,124,255,0.45)", "rgba(62,200,255,0.18)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>PN</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
