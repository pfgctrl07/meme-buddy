import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../components/GlassCard";
import { GradientCard } from "../components/GradientCard";
import { InfoTile } from "../components/InfoTile";
import { StatChip } from "../components/StatChip";
import { MiniLineChart } from "../components/Charts";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function ProfileScreen({ profile }) {
  return (
    <View style={styles.sectionStack}>
      <GradientCard colors={["rgba(95,94,255,0.28)", "rgba(10,16,34,0.96)"]}>
        <View style={styles.profileHeader}>
          <LinearGradient colors={["rgba(91,124,255,0.55)", "rgba(62,200,255,0.25)"]} style={styles.profileAvatarWrap}>
            <View style={styles.profileAvatarInner}>
              <Text style={styles.profileAvatarText}>PN</Text>
            </View>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileHandle}>{profile.handle}</Text>
            <Text style={styles.profileLevel}>{profile.level}</Text>
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          <StatChip label="Points" value={profile.totalPoints} />
          <StatChip label="Events" value={profile.eventsJoined} />
          <StatChip label="Win Rate" value={profile.winRate} />
        </View>
      </GradientCard>

      <GlassCard title="Achievements" subtitle="Badges + milestones">
        <View style={styles.badgeWrap}>
          {profile.achievements.map((badge) => (
            <View key={badge} style={styles.achievementChip}>
              <Ionicons name="checkmark-circle" size={16} color={theme.green} />
              <Text style={styles.achievementText}>{badge}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard title="Activity Graph" subtitle="Engagement over time">
        <MiniLineChart data={profile.activitySeries} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} variant="purple" />
      </GlassCard>

      <GlassCard title="Performance" subtitle="This week">
        <InfoTile icon="trending-up" title="12 simulations" body="You launched or joined twelve active trends across hashtags and meme coins." />
        <InfoTile icon="pulse" title="48.2K mentions" body="Your events generated strong visibility and consistently high trust across community pushes." />
        <InfoTile icon="ribbon" title="9 growth wins" body="Nine recent positions ended in bullish territory with above-average confidence." />
      </GlassCard>
    </View>
  );
}
