import { USE_MOCK_API } from "../config/api";
import { discoveryFeed } from "../data/mockData";
import { fetchJson } from "./http";

export async function fetchDiscovery(sort = "top_gaining") {
  if (USE_MOCK_API) {
    return discoveryFeed;
  }

  return fetchJson(`/api/discovery?sort=${encodeURIComponent(sort)}`);
}
