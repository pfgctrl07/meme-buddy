import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tabs } from "../data/mockData";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function BottomTabs({ activeTab, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bottomBar}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
        >
          <Ionicons name={tab.icon} size={18} color={activeTab === tab.key ? theme.text : theme.muted} />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
