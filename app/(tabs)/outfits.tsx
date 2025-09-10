import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, RotateCcw } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../lib/api";
import { API_BASE } from "../../lib/api";

type OutfitItemResponse = {
  imageUrl: string;
  position: number | null;
};

type OutfitResponse = {
  id: number;
  outfitName: string;
  lastWoreDate: string | null;
  numberOfWears: number;
  items: OutfitItemResponse[];
};

type WearTodayResponse = {
  wasUpdated: boolean;
  outfit: OutfitResponse;
};

export default function OutfitsScreen() {
  const [outfits, setOutfits] = useState<OutfitResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<OutfitResponse[]>("/outfits/all");
      const normalized = res.data.map((o) => ({
        ...o,
        items: (o.items ?? []).map((it) => ({
          ...it,
          imageUrl: API_BASE + (it.imageUrl ?? ""),
        })),
      }));
      setOutfits(normalized);
    } catch (e) {
      console.warn("[OUTFITS] fetch failed", e);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch de fiecare dată când ecranul devine activ
  useFocusEffect(
    useCallback(() => {
      fetchOutfits();
    }, [fetchOutfits])
  );

  const handleWearToday = useCallback(async (outfitId: number) => {
    try {
      const res = await api.post<WearTodayResponse>(
        `/outfits/${outfitId}/wear-today`
      );
      const data = res.data;

      if (!data?.outfit) return;

      const normalizedOutfit: OutfitResponse = {
        ...data.outfit,
        items: (data.outfit.items ?? []).map((it) => ({
          ...it,
          imageUrl: API_BASE + (it.imageUrl ?? ""),
        })),
      };

      setOutfits((prev) =>
        prev.map((o) => (o.id === outfitId ? normalizedOutfit : o))
      );

      if (data.wasUpdated) {
        Alert.alert("Updated", "Outfit marked as worn today.");
        console.log("[OUTFITS] updated wear for today");
      } else {
        Alert.alert("Error", "Outfit already marked for today.");
        console.log("[OUTFITS] already marked for today — no changes");
      }
    } catch (e: any) {
      console.warn(
        "[OUTFITS] wear-today failed",
        e?.response?.data || e?.message
      );
      Alert.alert("Error", "Could not update outfit for today.");
    }
  }, []);

  const total = outfits.length;

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={{ flex: 1, alignItems: "center", marginTop: 40 }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (total === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No outfits yet</Text>
          <TouchableOpacity
            style={[styles.wearTodayButton, { marginTop: 16 }]}
            onPress={() => {
              console.log("Generate outfits");
            }}
          >
            <Text style={styles.wearTodayText}>Generate</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Outfits List */}
        <View style={styles.outfitsList}>
          {outfits.map((outfit) => {
            const top = outfit.items.find((i) => i.position === 1)?.imageUrl;
            const bottom = outfit.items.find((i) => i.position === 2)?.imageUrl;
            const shoes = outfit.items.find((i) => i.position === 3)?.imageUrl;

            return (
              <View key={outfit.id} style={styles.outfitCard}>
                {/* Outfit Name */}
                <Text style={styles.outfitName}>
                  {outfit.outfitName || "My Outfit"}
                </Text>

                {/* Outfit Images */}
                <View style={styles.outfitImages}>
                  {/* Top */}
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Top</Text>
                    {top ? (
                      <Image
                        source={{ uri: top }}
                        style={styles.itemImageTop}
                      />
                    ) : (
                      <View style={[styles.itemImageTop, { opacity: 0.3 }]} />
                    )}
                  </View>

                  {/* Bottom */}
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Bottom</Text>
                    {bottom ? (
                      <Image
                        source={{ uri: bottom }}
                        style={styles.itemImageBottom}
                      />
                    ) : (
                      <View
                        style={[styles.itemImageBottom, { opacity: 0.3 }]}
                      />
                    )}
                  </View>

                  {/* Shoes */}
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Shoes</Text>
                    {shoes ? (
                      <Image source={{ uri: shoes }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, { opacity: 0.3 }]} />
                    )}
                  </View>
                </View>

                {/* Outfit Info */}
                <View style={styles.outfitInfo}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Calendar color="#FF69B4" size={16} />
                      <Text style={styles.infoLabel}>Last Wear</Text>
                      <Text style={styles.infoValue}>
                        {outfit.lastWoreDate
                          ? formatDate(outfit.lastWoreDate)
                          : "—"}
                      </Text>
                    </View>

                    <View style={styles.infoItem}>
                      <RotateCcw color="#FF69B4" size={16} />
                      <Text style={styles.infoLabel}>Wears</Text>
                      <Text style={styles.infoValue}>
                        {outfit.numberOfWears}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Wear Today Button */}
                <TouchableOpacity
                  style={styles.wearTodayButton}
                  onPress={() => handleWearToday(outfit.id)}
                >
                  <Text style={styles.wearTodayText}>Wear Today</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }, [loading, outfits, total, handleWearToday]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Outfits</Text>
        <Text style={styles.subtitle}>{total} outfits</Text>
      </View>

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 },
  header: { marginVertical: 20 },
  title: { fontSize: 28, fontFamily: "Inter-Bold", color: "#333333" },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginTop: 4,
  },
  outfitsList: { paddingBottom: 20 },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  outfitName: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 0,
    textAlign: "center",
  },
  outfitImages: { marginBottom: 20 },
  imageContainer: { marginBottom: 0 },
  imageLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#FF69B4",
    marginBottom: 8,
    marginLeft: 4,
  },
  itemImage: {
    width: "80%",
    height: 142,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignSelf: "center",
  },
  itemImageTop: {
    width: "60%",
    height: 140,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignSelf: "center",
  },
  itemImageBottom: {
    width: "60%",
    height: 190,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignSelf: "center",
  },
  outfitInfo: { marginBottom: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF0F5",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  infoItem: { alignItems: "center", flex: 1 },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: { fontSize: 15, fontFamily: "Inter-SemiBold", color: "#333333" },
  wearTodayButton: {
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wearTodayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 0,
  },
});
