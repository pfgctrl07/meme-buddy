import { USE_MOCK_API } from "../config/api";
import { alertsFeed } from "../data/mockData";
import { fetchJson } from "./http";

export async function fetchAlerts() {
  if (USE_MOCK_API) {
    return alertsFeed;
  }

  return fetchJson("/api/alerts");
}

export async function markAlertsRead(payload) {
  if (USE_MOCK_API) {
    return { success: true, ...payload };
  }

  return fetchJson("/api/alerts/read", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
