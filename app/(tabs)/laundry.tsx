import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WashingMachine, Droplets } from "lucide-react-native";
import { api, API_BASE } from "../../lib/api";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const itemWidth = (width - 60) / 2;

type ClothingItemResponse = {
  id: number;
  imageUrl: string;
  price: number;
  subcategoryId: number;
  isDirty: boolean;
  wornOut: boolean;
  numberOfWears: number;
  colourId?: number | null;
  locationId?: number | null;
  styleId?: number | null;
  colourName?: string | null;
  locationName?: string | null;
  styleName?: string | null;
  subcategoryName: string;
  lastWoreDate?: string | null;
};

export default function LaundryScreen() {
  const [items, setItems] = useState<ClothingItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [washingAll, setWashingAll] = useState(false);
  const [washingOne, setWashingOne] = useState<number | null>(null);

  const fetchDirty = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ClothingItemResponse[]>("/clothingitems/dirty");
      const normalized =
        res.data?.map((it) => ({
          ...it,
          imageUrl: it.imageUrl?.startsWith("http")
            ? it.imageUrl
            : `${API_BASE}${it.imageUrl ?? ""}`,
        })) ?? [];
      setItems(normalized);
    } catch (e) {
      console.warn("[LAUNDRY] fetch dirty failed:", e);
      setItems([]);
      Alert.alert("Error", "Failed to load laundry items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirty();
  }, [fetchDirty]);

  useFocusEffect(
    useCallback(() => {
      fetchDirty();
    }, [fetchDirty])
  );

  const handleWashAll = useCallback(async () => {
    if (items.length === 0) return;
    try {
      setWashingAll(true);
      const ids = items.map((i) => i.id);
      await api.post("/clothingitems/wash", { itemIds: ids });
      await fetchDirty();
    } catch (e: any) {
      console.warn("[LAUNDRY] wash all failed:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Wash All failed.";
      Alert.alert("Error", String(msg));
    } finally {
      setWashingAll(false);
    }
  }, [items, fetchDirty]);

  const handleMarkAsWashed = useCallback(
    async (itemId: number) => {
      try {
        setWashingOne(itemId);
        await api.patch(`/clothingitems/${itemId}/flags`, {
          isDirty: false,
          wornOut: null,
        });
        await fetchDirty();
      } catch (e: any) {
        console.warn("[LAUNDRY] mark washed failed:", e);
        const msg =
          e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to update item.";
        Alert.alert("Error", String(msg));
      } finally {
        setWashingOne(null);
      }
    },
    [fetchDirty]
  );

  const totalDirtyItems = items.length;

  const headerSubtitle = useMemo(() => {
    if (loading) return "Loading laundry…";
    return `${totalDirtyItems} ${
      totalDirtyItems === 1 ? "item" : "items"
    } need washing`;
  }, [loading, totalDirtyItems]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Laundry</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 24, alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : totalDirtyItems > 0 ? (
          <>
            {/* Wash All Button */}
            <TouchableOpacity
              style={[styles.washAllButton, washingAll && { opacity: 0.7 }]}
              onPress={handleWashAll}
              disabled={washingAll}
            >
              {washingAll ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <WashingMachine color="#FFFFFF" size={24} />
              )}
              <Text style={styles.washAllButtonText}>
                {washingAll ? "Washing..." : "Wash All"}
              </Text>
            </TouchableOpacity>

            {/* Dirty Items Grid */}
            <View style={styles.itemsGrid}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text numberOfLines={1} style={styles.itemTitle}>
                      {item.subcategoryName}
                    </Text>
                    <Text numberOfLines={1} style={styles.itemSubtitle}>
                      {item.locationName || "Location unknown"}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.markWashedButton,
                        washingOne === item.id && { opacity: 0.7 },
                      ]}
                      onPress={() => handleMarkAsWashed(item.id)}
                      disabled={washingOne === item.id}
                    >
                      {washingOne === item.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Droplets color="#FFFFFF" size={16} />
                      )}
                      <Text style={styles.markWashedButtonText}>
                        {washingOne === item.id
                          ? "Working..."
                          : "Mark as Washed"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <WashingMachine color="#FFB6C1" size={64} />
            <Text style={styles.emptyTitle}>All clean!</Text>
            <Text style={styles.emptySubtitle}>
              No items need washing right now
            </Text>
          </View>
        )}
      </ScrollView>
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
  washAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 24,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  washAllButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginLeft: 8,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: itemWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFB6C1",
  },
  itemImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  itemInfo: { padding: 12 },
  itemTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#333333",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginBottom: 12,
  },
  markWashedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  markWashedButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
