import { USE_MOCK_API } from "../config/api";
import { accuracySnapshot } from "../data/mockData";
import { fetchJson } from "./http";

export async function fetchAccuracy(coin) {
  if (USE_MOCK_API) {
    return accuracySnapshot;
  }

  if (coin) {
    return fetchJson(`/api/backtest/${encodeURIComponent(coin)}`);
  }

  return fetchJson("/api/backtest");
}
