import React from "react";
import { Pressable, Text, View } from "react-native";
import { createTrend, joinTrend } from "../services/trends";
import { GlassCard } from "../components/GlassCard";
import { InlineNotice } from "../components/Feedback";
import { InfoTile } from "../components/InfoTile";
import { InputField } from "../components/InputField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useMutation } from "../hooks/useMutation";
import { styles } from "../theme/styles";

export function CreateJoinScreen({ formTab, onSwitchTab, onTrendCreated, onTrendJoined }) {
  const [createForm, setCreateForm] = React.useState({
    name: "",
    asset: "",
    description: "",
  });
  const [joinCode, setJoinCode] = React.useState("");
  const [notice, setNotice] = React.useState(null);
  const createMutation = useMutation(createTrend);
  const joinMutation = useMutation(joinTrend);

  async function handleCreate() {
    try {
      const result = await createMutation.mutate(createForm);
      setNotice({
        tone: "success",
        message: `Trend created${result?.event?.code ? ` with code ${result.event.code}` : ""}.`,
      });
      setCreateForm({ name: "", asset: "", description: "" });
      onTrendCreated?.(result);
    } catch (error) {
      setNotice({ tone: "error", message: error.message });
    }
  }

  async function handleJoin() {
    try {
      const result = await joinMutation.mutate({ code: joinCode });
      setNotice({
        tone: "success",
        message: `Joined trend${result?.code ? ` ${result.code}` : ""}.`,
      });
      setJoinCode("");
      onTrendJoined?.(result);
    } catch (error) {
      setNotice({ tone: "error", message: error.message });
    }
  }

  return (
    <View style={styles.sectionStack}>
      <GlassCard title="Create or Join" subtitle="Event tools">
        <View style={styles.segmentedControl}>
          {["create", "join"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onSwitchTab(tab)}
              style={[styles.segmentButton, formTab === tab && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, formTab === tab && styles.segmentTextActive]}>
                {tab === "create" ? "Create Trend" : "Join Trend"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16 }}>
          <InlineNotice tone={notice?.tone} message={notice?.message} />
        </View>

        {formTab === "create" ? (
          <View style={styles.formStack}>
            <InputField
              label="Event Name"
              placeholder="Pepe World Cup Finals"
              value={createForm.name}
              onChangeText={(value) => setCreateForm((current) => ({ ...current, name: value }))}
              autoCapitalize="words"
              editable={!createMutation.isLoading}
            />
            <InputField
              label="Hashtag / Coin Name"
              placeholder="#PepeCup or $PEPECUP"
              value={createForm.asset}
              onChangeText={(value) => setCreateForm((current) => ({ ...current, asset: value }))}
              autoCapitalize="characters"
              editable={!createMutation.isLoading}
            />
            <InputField
              label="Description"
              placeholder="Describe the theme, community push, and target momentum."
              multiline
              value={createForm.description}
              onChangeText={(value) => setCreateForm((current) => ({ ...current, description: value }))}
              autoCapitalize="sentences"
              editable={!createMutation.isLoading}
            />
            <PrimaryButton
              label={createMutation.isLoading ? "Submitting..." : "Submit Trend"}
              onPress={handleCreate}
              icon="sparkles"
            />
          </View>
        ) : (
          <View style={styles.formStack}>
            <InputField
              label="Event Code"
              placeholder="Enter invite code"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              editable={!joinMutation.isLoading}
            />
            <PrimaryButton
              label={joinMutation.isLoading ? "Joining..." : "Join Trend"}
              onPress={handleJoin}
              icon="log-in-outline"
            />
          </View>
        )}
      </GlassCard>

      <GlassCard title="Event Design Notes" subtitle="Why this works">
        <InfoTile
          icon="flash"
          title="Hashtag or coin first"
          body="Every trend starts with a repeatable identity that can spread across social and trading communities."
        />
        <InfoTile
          icon="people"
          title="Join-code loops"
          body="Events feel exclusive, making participation more competitive and easier to track."
        />
        <InfoTile
          icon="analytics"
          title="Prediction ready"
          body="As soon as the event goes live, the engine can score trust, confidence, and growth direction."
        />
      </GlassCard>
    </View>
  );
}
