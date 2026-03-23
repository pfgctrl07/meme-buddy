import React from "react";
import { Text, View } from "react-native";
import { styles } from "../theme/styles";

export function LeaderboardRow({ entry, compact = false }) {
  const topThree = entry.rank <= 3;

  return (
    <View style={[styles.leaderboardRow, topThree && styles.leaderboardRowTop]}>
      <View style={styles.rowSpread}>
        <View
          style={[
            styles.rankBadge,
            entry.rank === 1 && { backgroundColor: "rgba(255,204,102,0.18)" },
            entry.rank === 2 && { backgroundColor: "rgba(183,195,215,0.18)" },
            entry.rank === 3 && { backgroundColor: "rgba(240,162,106,0.18)" },
          ]}
        >
          <Text style={styles.rankBadgeText}>#{entry.rank}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.leaderName, compact && styles.leaderNameCompact]}>{entry.name}</Text>
          <Text style={styles.leaderBadge}>{entry.badge}</Text>
        </View>
        <Text style={styles.leaderPoints}>{entry.points} pts</Text>
      </View>
    </View>
  );
}
