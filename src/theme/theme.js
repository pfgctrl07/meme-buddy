import { Dimensions } from "react-native";

export const { width: screenWidth } = Dimensions.get("window");
export const cardGap = 12;
export const statCardWidth = (screenWidth - 32 - cardGap) / 2;

export const theme = {
  bg: "#050816",
  panel: "#0D1428",
  card: "#111A33",
  cardAlt: "#0F1830",
  border: "rgba(255,255,255,0.08)",
  text: "#F8FAFC",
  muted: "#8FA3C7",
  blue: "#5B7CFF",
  cyan: "#3EC8FF",
  purple: "#8A5CFF",
  green: "#39D98A",
  red: "#FF6B7A",
  yellow: "#FFCC66",
  silver: "#B7C3D7",
  bronze: "#F0A26A",
};

export function predictionTone(label) {
  if (label === "Bearish") return theme.red;
  if (label === "Neutral") return theme.yellow;
  return theme.green;
}
