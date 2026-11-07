/**
 * The Trophy Room: a wooden cabinet with a shelf per kind of achievement. Earned trophies shine in
 * bronze, silver or gold; the rest wait as dim silhouettes with their progress. Tap one to see how
 * to earn it. Trophy figurines come from src/art/trophies.ts (prompts: docs/prompts/cards-and-trophies.md);
 * a trophy without art shows its emoji in a ring.
 */
import { Image } from "expo-image";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { TROPHY_ART } from "../art/trophies";

import {
  SHELVES,
  type AchievementStatus,
  type Tier,
} from "../engagement/achievements";
import { shadow, type } from "./theme";

const WOOD = {
  frame: "#5B3418",
  edge: "#3E220F",
  back: "#2E1A0E",
  plank: "#9A6534",
  plankTop: "#C08A50",
  plankShadow: "#1E1008",
};
export const TIER_COLORS: Record<
  Tier,
  { ring: string; face: string; text: string }
> = {
  bronze: { ring: "#CD7F32", face: "#F6D5B5", text: "#7A4316" },
  silver: { ring: "#A8B4C2", face: "#EEF2F6", text: "#4A5563" },
  gold: { ring: "#F2B730", face: "#FFF1C2", text: "#8A5A00" },
};

export function TrophyCabinet({ statuses }: { statuses: AchievementStatus[] }) {
  const earned = statuses.filter((s) => s.earned).length;
  return (
    <View
      style={{
        backgroundColor: WOOD.frame,
        borderRadius: 22,
        padding: 10,
        borderWidth: 3,
        borderColor: WOOD.edge,
        ...shadow,
        shadowOpacity: 0.35,
      }}
    >
      <View
        style={{
          backgroundColor: WOOD.back,
          borderRadius: 14,
          paddingTop: 12,
          paddingBottom: 4,
          overflow: "hidden",
        }}
      >
        {/* Brass plaque */}
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#C9A23A",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderWidth: 2,
            borderColor: "#8C6A16",
            marginBottom: 6,
          }}
        >
          <Text
            style={[
              type.tiny,
              { color: "#3E2A05", fontWeight: "900", letterSpacing: 1.5 },
            ]}
          >
            TROPHY ROOM · {earned}/{statuses.length}
          </Text>
        </View>
        {SHELVES.map((shelf) => (
          <View key={shelf.id} style={{ marginTop: 6 }}>
            <Text
              style={[
                type.tiny,
                {
                  color: "#E8C99A",
                  fontWeight: "800",
                  marginLeft: 14,
                  marginBottom: 2,
                  letterSpacing: 0.5,
                },
              ]}
            >
              {shelf.title.toUpperCase()}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 12,
                gap: 6,
                alignItems: "flex-end",
              }}
            >
              {statuses
                .filter((s) => s.achievement.shelf === shelf.id)
                .map((s) => (
                  <Trophy key={s.achievement.id} status={s} />
                ))}
            </ScrollView>
            {/* The shelf board, with a lit top edge and a shadow under it */}
            <View
              style={{
                height: 3,
                backgroundColor: WOOD.plankTop,
                marginHorizontal: 4,
              }}
            />
            <View
              style={{
                height: 9,
                backgroundColor: WOOD.plank,
                marginHorizontal: 4,
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
              }}
            />
            <View
              style={{
                height: 6,
                backgroundColor: WOOD.plankShadow,
                opacity: 0.6,
                marginHorizontal: 10,
              }}
            />
          </View>
        ))}
        {/* A faint sheen across the glass */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -60,
            left: "58%",
            width: 46,
            height: 900,
            backgroundColor: "rgba(255,255,255,0.05)",
            transform: [{ rotate: "16deg" }],
          }}
        />
      </View>
    </View>
  );
}

function Trophy({ status }: { status: AchievementStatus }) {
  const { achievement: a, earned, value } = status;
  const tier = TIER_COLORS[a.tier];
  const progressText = `${value} / ${a.target}`;
  const art = TROPHY_ART[a.id];
  return (
    <Pressable
      onPress={() =>
        Alert.alert(
          `${a.emoji} ${a.title}`,
          earned
            ? `Earned! ${a.how}.`
            : `${a.how}.${a.target > 1 ? `\n\nSo far: ${progressText}` : ""}`,
        )
      }
      accessibilityRole="button"
      accessibilityLabel={`${a.title}, ${a.tier} trophy. ${earned ? "Earned." : `Not yet: ${a.how}.`}`}
      style={{
        width: 76,
        alignItems: "center",
        paddingBottom: 6,
        paddingTop: 4,
      }}
    >
      {art ? (
        // The figurine: full colour once earned, a dark silhouette until then.
        <View
          style={{
            width: 66,
            height: 66,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {earned ? (
            <View
              style={{
                position: "absolute",
                bottom: 2,
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: tier.ring,
                opacity: 0.22,
              }}
            />
          ) : null}
          <Image
            source={art}
            style={{ width: 62, height: 62, opacity: earned ? 1 : 0.5 }}
            contentFit="contain"
            tintColor={earned ? undefined : "#120A04"}
            accessible={false}
          />
        </View>
      ) : (
        <View
          style={{
            width: 62,
            height: 62,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {earned ? (
            <View
              style={{
                position: "absolute",
                width: 62,
                height: 62,
                borderRadius: 31,
                backgroundColor: tier.ring,
                opacity: 0.25,
              }}
            />
          ) : null}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              borderWidth: 4,
              borderColor: earned ? tier.ring : "rgba(255,255,255,0.14)",
              backgroundColor: earned ? tier.face : "rgba(0,0,0,0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, opacity: earned ? 1 : 0.22 }}>
              {a.emoji}
            </Text>
          </View>
        </View>
      )}
      {earned ? (
        <View
          style={{
            backgroundColor: tier.ring,
            borderRadius: 4,
            paddingHorizontal: 4,
            marginTop: -6,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {a.tier.toUpperCase()}
          </Text>
        </View>
      ) : status.progress > 0 ? (
        <View
          style={{
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.15)",
            marginTop: 0,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.round(status.progress * 100)}%`,
              height: 4,
              backgroundColor: tier.ring,
            }}
          />
        </View>
      ) : (
        <Text style={{ fontSize: 10, marginTop: -2 }}>🔒</Text>
      )}
      <Text
        style={[
          type.tiny,
          {
            color: earned ? "#FFF4E0" : "rgba(255,244,224,0.5)",
            textAlign: "center",
            fontSize: 10,
            marginTop: 3,
            fontWeight: "700",
          },
        ]}
        numberOfLines={2}
      >
        {a.title}
      </Text>
    </Pressable>
  );
}
