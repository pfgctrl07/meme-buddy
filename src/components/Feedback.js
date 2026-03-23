import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../theme/styles";
import { theme } from "../theme/theme";

export function LoadingState({ label = "Loading..." }) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>{label}</Text>
      <Text style={styles.feedbackBody}>Fetching the latest Meme Buddy data.</Text>
    </View>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <View style={[styles.feedbackCard, styles.errorCard]}>
      <Text style={styles.feedbackTitle}>{title}</Text>
      <Text style={styles.feedbackBody}>{message || "Please try again."}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={[styles.retryButtonText, { color: theme.text }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function InlineNotice({ tone = "info", message }) {
  if (!message) return null;

  const palette =
    tone === "error"
      ? { bg: "rgba(255,107,122,0.12)", text: theme.red }
      : tone === "success"
        ? { bg: "rgba(57,217,138,0.12)", text: theme.green }
        : { bg: "rgba(255,204,102,0.12)", text: theme.yellow };

  return (
    <View style={[styles.inlineNotice, { backgroundColor: palette.bg }]}>
      <Text style={[styles.inlineNoticeText, { color: palette.text }]}>{message}</Text>
    </View>
  );
}
