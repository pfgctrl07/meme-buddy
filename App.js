import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabs } from "./src/components/BottomTabs";
import { ErrorState, LoadingState } from "./src/components/Feedback";
import { Header } from "./src/components/Header";
import { trendEvents } from "./src/data/mockData";
import {
  useAccuracyData,
  useAlertsData,
  useDashboardData,
  useDiscoveryData,
  useLeaderboardData,
  useProfileData,
  useTrendData,
} from "./src/hooks/useAppData";
import { AccuracyScreen } from "./src/screens/AccuracyScreen";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { CreateJoinScreen } from "./src/screens/CreateJoinScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { DiscoveryScreen } from "./src/screens/DiscoveryScreen";
import { EventDetailScreen } from "./src/screens/EventDetailScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { styles } from "./src/theme/styles";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formTab, setFormTab] = useState("create");
  const [eventMetricTab, setEventMetricTab] = useState("mentions");
  const [discoveryFilter, setDiscoveryFilter] = useState("Top gaining");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeTab, fade]);

  const dashboardQuery = useDashboardData();
  const alertsQuery = useAlertsData();
  const leaderboardQuery = useLeaderboardData();
  const profileQuery = useProfileData();
  const discoveryQuery = useDiscoveryData(discoveryFilter);

  const primaryEventCode = useMemo(() => {
    return (
      selectedEventId ||
      dashboardQuery.data?.activeEvent?.coinId ||
      dashboardQuery.data?.activeEvent?.code ||
      dashboardQuery.data?.trendingEvents?.[0]?.coinId ||
      dashboardQuery.data?.trendingEvents?.[0]?.code ||
      trendEvents[0].coinId ||
      trendEvents[0].code
    );
  }, [dashboardQuery.data, selectedEventId]);

  const accuracyQuery = useAccuracyData(primaryEventCode);
  const trendQuery = useTrendData(primaryEventCode);

  const activeEvent = trendQuery.event;
  const dashboardData = dashboardQuery.data;
  const hasPrimaryLoadError =
    (activeTab === "dashboard" && dashboardQuery.error) ||
    (activeTab === "event" && trendQuery.error) ||
    (activeTab === "accuracy" && accuracyQuery.error) ||
    (activeTab === "discover" && discoveryQuery.error) ||
    (activeTab === "alerts" && alertsQuery.error) ||
    (activeTab === "leaderboard" && leaderboardQuery.error) ||
    (activeTab === "profile" && profileQuery.error);

  function openEvent(event) {
    if (!event) return;
    setSelectedEventId(event.coinId || event.code || event.id || event.symbol);
    setActiveTab("event");
  }

  async function refreshAppData() {
    await Promise.all([
      dashboardQuery.reload(),
      alertsQuery.reload(),
      accuracyQuery.reload(),
      discoveryQuery.reload(),
      leaderboardQuery.reload(),
      profileQuery.reload(),
    ]);
  }

  async function handleTrendCreated(result) {
    const nextEvent = result?.event;
    setSelectedEventId(nextEvent?.coinId || nextEvent?.code || nextEvent?.id || null);
    await refreshAppData();
    setActiveTab("event");
  }

  async function handleTrendJoined(result) {
    const nextEvent = result?.event || { code: result?.code };
    setSelectedEventId(nextEvent?.coinId || nextEvent?.code || nextEvent?.id || null);
    await refreshAppData();
    setActiveTab("event");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0E1431", "#050816", "#04060E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <View style={styles.appShell}>
        <Header activeTab={activeTab} alertsCount={alertsQuery.data?.length || 0} />

        <Animated.View style={[styles.sceneContainer, { opacity: fade }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {activeTab === "dashboard" && dashboardQuery.isLoading && !dashboardData ? <LoadingState label="Loading dashboard" /> : null}
            {activeTab === "event" && trendQuery.isLoading && !activeEvent ? <LoadingState label="Loading event" /> : null}
            {activeTab === "discover" && discoveryQuery.isLoading && !discoveryQuery.data ? <LoadingState label="Loading discovery" /> : null}
            {activeTab === "accuracy" && accuracyQuery.isLoading && !accuracyQuery.data ? <LoadingState label="Loading benchmark" /> : null}
            {activeTab === "alerts" && alertsQuery.isLoading && !alertsQuery.data ? <LoadingState label="Loading alerts" /> : null}
            {activeTab === "leaderboard" && leaderboardQuery.isLoading && !leaderboardQuery.data ? <LoadingState label="Loading leaderboard" /> : null}
            {activeTab === "profile" && profileQuery.isLoading && !profileQuery.data ? <LoadingState label="Loading profile" /> : null}

            {hasPrimaryLoadError ? (
              <ErrorState
                title="Could not load this screen"
                message={hasPrimaryLoadError.message}
                onRetry={() => {
                  if (activeTab === "dashboard") return dashboardQuery.reload();
                  if (activeTab === "event") return trendQuery.reload();
                  if (activeTab === "accuracy") return accuracyQuery.reload();
                  if (activeTab === "discover") return discoveryQuery.reload();
                  if (activeTab === "alerts") return alertsQuery.reload();
                  if (activeTab === "leaderboard") return leaderboardQuery.reload();
                  if (activeTab === "profile") return profileQuery.reload();
                }}
              />
            ) : null}

            {activeTab === "dashboard" && (
              <DashboardScreen
                activeEvent={activeEvent}
                trendingEvents={dashboardData?.trendingEvents || trendEvents}
                dashboardStats={dashboardData?.stats || []}
                leaderboardPreview={dashboardData?.leaderboardPreview || []}
                onCreate={() => setActiveTab("create")}
                onOpenAlerts={() => setActiveTab("alerts")}
                onOpenEvent={openEvent}
              />
            )}
            {activeTab === "create" && (
              <CreateJoinScreen
                formTab={formTab}
                onSwitchTab={setFormTab}
                onTrendCreated={handleTrendCreated}
                onTrendJoined={handleTrendJoined}
              />
            )}
            {activeTab === "event" && (
              <EventDetailScreen
                event={activeEvent}
                leaderboard={trendQuery.leaderboard}
                metricTab={eventMetricTab}
                onMetricTabChange={setEventMetricTab}
              />
            )}
            {activeTab === "accuracy" && <AccuracyScreen benchmark={accuracyQuery.data} />}
            {activeTab === "discover" && (
              <DiscoveryScreen
                filter={discoveryFilter}
                items={discoveryQuery.data || []}
                onFilterChange={setDiscoveryFilter}
                onOpenEvent={openEvent}
              />
            )}
            {activeTab === "alerts" && <AlertsScreen alerts={alertsQuery.data || []} />}
            {activeTab === "leaderboard" && <LeaderboardScreen leaderboard={leaderboardQuery.data || []} />}
            {activeTab === "profile" && profileQuery.data ? <ProfileScreen profile={profileQuery.data} /> : null}
          </ScrollView>
        </Animated.View>

        <View style={styles.bottomBarWrap}>
          <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
        </View>
      </View>
    </SafeAreaView>
  );
}
