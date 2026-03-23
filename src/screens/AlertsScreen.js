import React from "react";
import { View } from "react-native";
import { AlertCard } from "../components/Alerts";
import { GlassCard } from "../components/GlassCard";
import { InfoTile } from "../components/InfoTile";
import { styles } from "../theme/styles";

export function AlertsScreen({ alerts }) {
  return (
    <View style={styles.sectionStack}>
      <GlassCard title="Triggered Alerts" subtitle="AI signal feed">
        {alerts.map((alert) => (
          <AlertCard key={`${alert.title}-${alert.timestamp}`} alert={alert} />
        ))}
      </GlassCard>

      <GlassCard title="How to read alerts" subtitle="Urgency guide">
        <InfoTile icon="warning" title="Yellow" body="The model sees caution or watchlist behavior, but the move is not fully confirmed." />
        <InfoTile icon="arrow-up-circle" title="Green" body="Strong Growth Signal alerts mark trends with strong traction and supportive trust metrics." />
        <InfoTile icon="alert-circle" title="Red" body="Decline or sell-side alerts mean the system sees fading momentum or crowd overextension." />
      </GlassCard>
    </View>
  );
}
