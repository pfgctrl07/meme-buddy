import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../components/GlassCard";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { styles } from "../theme/styles";

export function LeaderboardScreen({ leaderboard }) {
  return (
    <View style={styles.sectionStack}>
      <View style={styles.podiumRow}>
        {leaderboard.slice(0, 3).map((entry, index) => (
          <LinearGradient
            key={entry.rank}
            colors={
              index === 0
                ? ["rgba(255,204,102,0.30)", "rgba(17,26,51,0.96)"]
                : index === 1
                  ? ["rgba(183,195,215,0.28)", "rgba(17,26,51,0.96)"]
                  : ["rgba(240,162,106,0.28)", "rgba(17,26,51,0.96)"]
            }
            style={styles.podiumCard}
          >
            <Text style={styles.podiumRank}>#{entry.rank}</Text>
            <Text style={styles.podiumName}>{entry.name}</Text>
            <Text style={styles.podiumBadge}>{entry.badge}</Text>
            <Text style={styles.podiumPoints}>{entry.points} pts</Text>
          </LinearGradient>
        ))}
      </View>

      <GlassCard title="Global Rankings" subtitle="Points + badges">
        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </GlassCard>
    </View>
  );
}
