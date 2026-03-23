import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { PredictionPill, TrustBadge } from "../components/Badges";
import { GlassCard } from "../components/GlassCard";
import { InfoTile } from "../components/InfoTile";
import { MiniMetric } from "../components/StatCard";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function DiscoveryScreen({ filter, items, onFilterChange, onOpenEvent }) {
  const filters = ["Top gaining", "Most active", "High trust"];

  const filteredFeed = useMemo(() => {
    if (filter === "Most active") return [...items].sort((a, b) => b.score - a.score);
    if (filter === "High trust") return [...items].sort((a, b) => (a.trust === "Reliable" ? -1 : 1));
    return [...items].sort((a, b) => parseFloat(b.growth) - parseFloat(a.growth));
  }, [filter, items]);

  return (
    <View style={styles.sectionStack}>
      <GlassCard title="Trend Discovery" subtitle="Coins + hashtags">
        <View style={styles.segmentedWrap}>
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => onFilterChange(item)}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === item && styles.filterChipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {filteredFeed.map((item) => (
          <Pressable
            key={item.code || item.coinId || item.symbol}
            onPress={() => onOpenEvent?.(item)}
            style={styles.discoveryRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.discoveryTitle}>{item.name || item.symbol}</Text>
              <Text style={styles.discoveryMeta}>{item.activity}</Text>
            </View>
            <View style={styles.discoveryMetrics}>
              <MiniMetric label="Score" value={`${item.score}`} />
              <MiniMetric label="Growth" value={item.growth} tone={item.growth.startsWith("-") ? theme.red : theme.green} />
            </View>
            <View style={styles.discoveryTags}>
              <PredictionPill label={item.prediction} compact />
              <TrustBadge value={item.trust} />
            </View>
          </Pressable>
        ))}
      </GlassCard>

      <GlassCard title="Insights" subtitle="Discovery cues">
        <InfoTile icon="trending-up" title="Top gaining" body="Growth leaders mix rising mentions with healthy trust and fewer signs of hype washout." />
        <InfoTile icon="sparkles" title="Most active" body="Activity leaders create the most raw signal, but not every noisy trend is worth trusting." />
        <InfoTile icon="shield-checkmark" title="High trust" body="Reliable trends are more likely to carry than attention spikes built on weak conviction." />
      </GlassCard>
    </View>
  );
}
