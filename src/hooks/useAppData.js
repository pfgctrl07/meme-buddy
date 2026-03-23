import { useMemo } from "react";
import {
  accuracySnapshot as accuracyFallback,
  alertsFeed as alertsFallback,
  dashboardStats as dashboardStatsFallback,
  discoveryFeed as discoveryFallback,
  leaderboard as leaderboardFallback,
  profile as profileFallback,
  trendEvents,
} from "../data/mockData";
import { fetchAccuracy } from "../services/accuracy";
import { fetchAlerts } from "../services/alerts";
import { fetchDashboard } from "../services/dashboard";
import { fetchDiscovery } from "../services/discovery";
import { fetchLeaderboard } from "../services/leaderboard";
import { fetchProfile } from "../services/profile";
import { fetchTrendAnalytics, fetchTrendDetail, fetchTrendLeaderboard } from "../services/trends";
import { useAsyncResource } from "./useAsyncResource";

export function useDashboardData() {
  return useAsyncResource(fetchDashboard, {
    initialData: {
      stats: dashboardStatsFallback,
      trendingEvents: trendEvents,
      leaderboardPreview: leaderboardFallback.slice(0, 3),
      alertsPreview: alertsFallback,
      activeEvent: trendEvents[0],
    },
  });
}

export function useDiscoveryData(filter) {
  const sort = useMemo(() => {
    if (filter === "Most active") return "most_active";
    if (filter === "High trust") return "high_trust";
    return "top_gaining";
  }, [filter]);

  return useAsyncResource(() => fetchDiscovery(sort), {
    initialData: discoveryFallback,
  });
}

export function useAlertsData() {
  return useAsyncResource(fetchAlerts, {
    initialData: alertsFallback,
  });
}

export function useAccuracyData(coin) {
  return useAsyncResource(() => fetchAccuracy(coin), {
    initialData: accuracyFallback,
  });
}

export function useLeaderboardData() {
  return useAsyncResource(fetchLeaderboard, {
    initialData: leaderboardFallback,
  });
}

export function useProfileData() {
  return useAsyncResource(fetchProfile, {
    initialData: profileFallback,
  });
}

export function useTrendData(idOrCode) {
  const detailQuery = useAsyncResource(() => fetchTrendDetail(idOrCode), {
    initialData: trendEvents[0],
    enabled: Boolean(idOrCode),
  });

  const leaderboardQuery = useAsyncResource(() => fetchTrendLeaderboard(idOrCode), {
    initialData: leaderboardFallback,
    enabled: Boolean(idOrCode),
  });

  const analyticsQuery = useAsyncResource(() => fetchTrendAnalytics(idOrCode), {
    initialData: {
      mentionsSeries: trendEvents[0].mentionsSeries,
      volumeSeries: trendEvents[0].volumeSeries,
      heat: trendEvents[0].heat,
    },
    enabled: Boolean(idOrCode),
  });

  const mergedEvent = useMemo(() => {
    if (!detailQuery.data) return trendEvents[0];
    return {
      ...detailQuery.data,
      ...(analyticsQuery.data || {}),
    };
  }, [detailQuery.data, analyticsQuery.data]);

  return {
    event: mergedEvent,
    leaderboard: leaderboardQuery.data || leaderboardFallback,
    isLoading: detailQuery.isLoading || analyticsQuery.isLoading || leaderboardQuery.isLoading,
    error: detailQuery.error || analyticsQuery.error || leaderboardQuery.error,
    reload: async () => {
      await Promise.all([detailQuery.reload(), analyticsQuery.reload(), leaderboardQuery.reload()]);
    },
  };
}
