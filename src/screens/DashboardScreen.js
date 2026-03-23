import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AlertBanner } from "../components/Alerts";
import { DataBadge, PredictionPill } from "../components/Badges";
import { GlassCard } from "../components/GlassCard";
import { GradientCard } from "../components/GradientCard";
import { HeatmapGrid, MiniLineChart } from "../components/Charts";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { MiniMetric, StatCard } from "../components/StatCard";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function DashboardScreen({
  activeEvent,
  trendingEvents,
  dashboardStats,
  leaderboardPreview,
  onCreate,
  onOpenAlerts,
  onOpenEvent,
}) {
  return (
    <View style={styles.sectionStack}>
      <GradientCard colors={["rgba(95,94,255,0.34)", "rgba(9,14,30,0.94)"]}>
        <Text style={styles.heroKicker}>AI trend intelligence</Text>
        <Text style={styles.heroTitle}>Simulate meme momentum before the market notices.</Text>
        <Text style={styles.heroBody}>
          Create hashtag or meme coin events, watch live engagement pile up, and use AI trust + confidence scores to decide what is real.
        </Text>
        <PrimaryButton label="+ Create Trend" onPress={onCreate} icon="add" />
      </GradientCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {trendingEvents.map((event) => (
          <Pressable key={event.code} onPress={() => onOpenEvent?.(event)}>
            <LinearGradient
              colors={["rgba(91,124,255,0.24)", "rgba(17,26,51,0.95)"]}
              style={styles.trendingCard}
            >
              <View style={styles.rowSpread}>
                <Text style={styles.trendingCardTitle}>{event.name}</Text>
                <PredictionPill label={event.prediction} compact />
              </View>
              <Text style={styles.eventHash}>{event.asset}</Text>
              <Text style={styles.eventMeta}>{event.status}</Text>
              <View style={styles.cardMetricRow}>
                <MiniMetric label="Score" value={`${event.trendScore}`} />
                <MiniMetric
                  label="Trust"
                  value={event.trustScore}
                  tone={event.trustScore === "Reliable" ? theme.green : theme.red}
                />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.statsGrid}>
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            icon={<Ionicons name={stat.icon} size={16} color={stat.tone} />}
          />
        ))}
      </View>

      <GlassCard title="Mentions vs Time" subtitle="Realtime pulse">
        <MiniLineChart data={activeEvent.mentionsSeries} labels={["8A", "10A", "12P", "2P", "4P", "6P", "8P", "Now"]} />
      </GlassCard>

      <GlassCard title="Prediction Snapshot" subtitle="Trust + confidence">
        <LinearGradient
          colors={["rgba(91,124,255,0.24)", "rgba(57,217,138,0.10)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.predictionBox}
        >
          <View style={styles.rowSpread}>
            <View>
              <Text style={styles.predictionLabel}>Trend Score</Text>
              <Text style={styles.predictionValue}>{activeEvent.trendScore} / 100</Text>
            </View>
            <View style={styles.predictionIconBubble}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={22} color={theme.green} />
            </View>
          </View>

          <View style={styles.kpiRow}>
            <DataBadge label="Prediction" value={activeEvent.prediction} tone={theme.green} />
            <DataBadge label="Trust" value={activeEvent.trustScore} tone={theme.cyan} />
            <DataBadge label="Confidence" value={`${activeEvent.confidence}%`} tone={theme.yellow} />
          </View>

          <Text style={styles.predictionCopy}>
            {activeEvent.analysis?.usedFallback
              ? "Live APIs were unavailable, so this card is using the prototype fallback simulator for the current signal."
              : "This prediction is coming from the uploaded API model using live price change, trend score, volume, and trust inputs."}
          </Text>
          <Text style={[styles.eventMeta, { marginTop: 10 }]}>
            Accuracy: {activeEvent.analysis?.accuracy?.label || "Unverified"}.
            {" "}
            {activeEvent.analysis?.accuracy?.note || "Historical benchmark data is not available yet."}
          </Text>
        </LinearGradient>
      </GlassCard>

      <Pressable onPress={onOpenAlerts}>
        <AlertBanner event={activeEvent} />
      </Pressable>

      <GlassCard title="Engagement Heatmap" subtitle="Channel intensity">
        <HeatmapGrid values={activeEvent.heat} />
      </GlassCard>

      <GlassCard title="Top 3" subtitle="Leaderboard preview">
        {leaderboardPreview.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} compact />
        ))}
      </GlassCard>
    </View>
  );
}
