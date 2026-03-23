import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather, Ionicons, Octicons } from "@expo/vector-icons";
import { AlertBanner } from "../components/Alerts";
import { DataBadge, PredictionPill } from "../components/Badges";
import { GlassCard } from "../components/GlassCard";
import { GradientCard } from "../components/GradientCard";
import { InfoTile } from "../components/InfoTile";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { MiniLineChart } from "../components/Charts";
import { StatCard } from "../components/StatCard";
import { styles } from "../theme/styles";
import { predictionTone, theme } from "../theme/theme";

export function EventDetailScreen({ event, leaderboard, metricTab, onMetricTabChange }) {
  const chartData = metricTab === "mentions" ? event.mentionsSeries : event.volumeSeries;
  const analysis = event.analysis;

  return (
    <View style={styles.sectionStack}>
      <GradientCard colors={["rgba(95,94,255,0.26)", "rgba(12,18,36,0.96)"]}>
        <View style={styles.rowSpread}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventDetailTitle}>{event.name}</Text>
            <Text style={styles.eventHash}>{event.asset}</Text>
            <Text style={styles.eventMeta}>Event code {event.code} • AI monitoring trust, engagement, and signal strength.</Text>
          </View>
          <PredictionPill label={event.prediction} />
        </View>
      </GradientCard>

      <Pressable>
        <AlertBanner event={event} />
      </Pressable>

      <View style={styles.statsGrid}>
        <StatCard label="Views" value={event.views} detail="audience reach" icon={<Ionicons name="eye-outline" size={16} color={theme.cyan} />} />
        <StatCard label="Clicks" value={event.clicks} detail="conversion intent" icon={<Feather name="mouse-pointer" size={16} color={theme.blue} />} />
        <StatCard label="Mentions" value={event.mentions} detail="social spread" icon={<Octicons name="mention" size={16} color={theme.purple} />} />
        <StatCard label="Volume" value={event.volume} detail="market activity" icon={<Ionicons name="cash-outline" size={16} color={theme.green} />} />
      </View>

      <GlassCard title="Growth Over Time" subtitle="Interactive graph">
        <View style={styles.segmentedControl}>
          {["mentions", "volume"].map((item) => (
            <Pressable
              key={item}
              onPress={() => onMetricTabChange(item)}
              style={[styles.segmentButton, metricTab === item && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, metricTab === item && styles.segmentTextActive]}>
                {item === "mentions" ? "Mentions" : "Volume"}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 16 }}>
          <MiniLineChart
            data={chartData}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"]}
            variant={metricTab === "mentions" ? "blue" : "purple"}
          />
        </View>
      </GlassCard>

      <GlassCard title="Prediction Panel" subtitle="Model output">
        <View style={styles.predictionPanel}>
          <View style={styles.rowSpread}>
            <View>
              <Text style={styles.predictionLabel}>Trend Score</Text>
              <Text style={styles.scoreHuge}>{event.trendScore}</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreCircleText}>{event.confidence}%</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.kpiRow}>
            <DataBadge label="Prediction" value={event.prediction} tone={predictionTone(event.prediction)} />
            <DataBadge label="Trust" value={event.trustScore} tone={event.trustScore === "Reliable" ? theme.green : theme.red} />
            <DataBadge label="Confidence" value={`${event.confidence}%`} tone={theme.yellow} />
          </View>
          <Text style={styles.predictionCopy}>
            The model sees {event.prediction.toLowerCase()} conditions with {event.trustScore.toLowerCase()} social behavior and a {event.confidence}% confidence signal.
          </Text>
        </View>
      </GlassCard>

      <GlassCard title="Model Diagnostics" subtitle="Prediction breakdown">
        <View style={styles.kpiRow}>
          <DataBadge label="Engine" value={analysis?.engine === "uploaded_meme_coin_api" ? "Uploaded API" : "Simulator"} tone={theme.cyan} />
          <DataBadge label="Source" value={analysis?.source === "uploaded_api" ? "Live APIs" : analysis?.source === "fallback_simulator" ? "Fallback" : "Custom Event"} tone={theme.blue} />
          <DataBadge label="Accuracy" value={analysis?.accuracy?.label || "Unverified"} tone={theme.yellow} />
        </View>
        <View style={{ marginTop: 14 }}>
          <InfoTile
            icon="pulse"
            title={`Weighted score ${analysis?.weightedScore ?? "-"}`}
            body={`This signal blends price change ${analysis?.priceChangePct ?? 0}%, Google trend score ${analysis?.trendScoreRaw ?? event.trendScore}, and trust ${analysis?.trustScoreRaw ?? "n/a"}.`}
          />
          <InfoTile
            icon="git-compare"
            title={`Calibrated ${analysis?.calibratedPrediction || event.prediction}`}
            body={`Raw model label: ${analysis?.rawModelPrediction || event.rawModelPrediction || event.prediction}. The app now uses the calibrated labeler that matches the benchmark scorer.`}
          />
          <InfoTile
            icon="analytics"
            title={analysis?.spike || "Signal state"}
            body={`Verdict: ${analysis?.verdict || "Unknown"}. ${analysis?.accuracy?.note || "No benchmark note available."}`}
          />
        </View>
      </GlassCard>

      <GlassCard title="Leaderboard" subtitle="Ranked operators">
        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </GlassCard>
    </View>
  );
}
