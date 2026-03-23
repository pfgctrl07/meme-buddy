import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { DataBadge } from "../components/Badges";
import { GlassCard } from "../components/GlassCard";
import { InfoTile } from "../components/InfoTile";
import { MiniMetric } from "../components/StatCard";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function AccuracyScreen({ benchmark }) {
  const topCases = useMemo(() => (benchmark?.details || []).slice(0, 6), [benchmark]);

  return (
    <View style={styles.sectionStack}>
      <GlassCard title="Model Accuracy" subtitle="Hackathon benchmark">
        <View style={styles.kpiRow}>
          <DataBadge label="Accuracy" value={`${benchmark?.accuracyPct ?? 0}%`} tone={theme.green} />
          <DataBadge label="Correct" value={`${benchmark?.correctCases ?? 0}/${benchmark?.totalCases ?? 0}`} tone={theme.cyan} />
          <DataBadge label="Scope" value={benchmark?.scope === "coin" ? "Per Coin" : "Global"} tone={theme.yellow} />
        </View>
        <Text style={[styles.predictionCopy, { marginTop: 14 }]}>
          This benchmark uses stored cases scored with the calibrated uploaded-model rules. It is a prototype benchmark, not a production validation study.
        </Text>
      </GlassCard>

      <GlassCard title="Calibration Notes" subtitle="Why the score changed">
        <InfoTile
          icon="options"
          title="Thresholds tuned"
          body="The live labeler now uses calibrated bullish and bearish thresholds plus strong up/down overrides, matching the benchmark scorer."
        />
        <InfoTile
          icon="server"
          title="Shared rule path"
          body="Backtests and live API predictions now use the same classifier, so the measured score actually reflects what the app shows."
        />
      </GlassCard>

      <GlassCard title="Case Breakdown" subtitle="Recent benchmark cases">
        {topCases.map((item, index) => (
          <View key={`${item.coin}-${index}`} style={[styles.discoveryRow, { marginBottom: index === topCases.length - 1 ? 0 : 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.discoveryTitle}>{item.coin}</Text>
              <Text style={styles.discoveryMeta}>
                Change {item.changePct}% • Trend {item.trendScore} • Trust {item.trustScore}
              </Text>
            </View>
            <View style={styles.discoveryMetrics}>
              <MiniMetric label="Predicted" value={item.predicted} tone={item.correct ? theme.green : theme.red} />
              <MiniMetric label="Expected" value={item.expected} tone={theme.cyan} />
            </View>
            <View style={styles.discoveryTags}>
              <DataBadge label="Result" value={item.correct ? "Match" : "Miss"} tone={item.correct ? theme.green : theme.red} />
            </View>
          </View>
        ))}
      </GlassCard>
    </View>
  );
}
