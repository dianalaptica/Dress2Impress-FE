import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Droplet } from "lucide-react-native";
import { api, API_BASE } from "../lib/api";

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

export default function CategoryItemsScreen() {
  const { categoryId, label } = useLocalSearchParams<{
    categoryId?: string;
    label?: string;
  }>();
  const catId = useMemo(
    () => (categoryId ? parseInt(String(categoryId), 10) : NaN),
    [categoryId]
  );
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClothingItemResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const title = label ? String(label) : "Category";

  useEffect(() => {
    const fetchData = async () => {
      if (!catId || Number.isNaN(catId)) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ClothingItemResponse[]>(
          `/clothingitems/by-category/${catId}`
        );
        const data = (res.data ?? []).map((it) => ({
          ...it,
          imageUrl: it.imageUrl?.startsWith("http")
            ? it.imageUrl
            : `${API_BASE}${it.imageUrl ?? ""}`,
        }));
        setItems(data);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            e?.response?.data ||
            e?.message ||
            "Failed to load items."
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catId]);

  const handleItemPress = (item: ClothingItemResponse) => {
    router.push({
      pathname: "/edit-item",
      params: {
        id: item.id.toString(),
        imageUrl: item.imageUrl,
        price: item.price,
        subcategoryName: item.subcategoryName,
        colourName: item.colourName || "",
        locationName: item.locationName || "",
        styleName: item.styleName || "",
        isDirty: item.isDirty.toString(),
        wornOut: item.wornOut.toString(),
        numberOfWears: item.numberOfWears,
        lastWoreDate: item.lastWoreDate,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FF69B4" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>
            Add your first clothing item to see it here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        >
          <View style={styles.grid}>
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={styles.card}
                onPress={() => handleItemPress(it)}
              >
                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: it.imageUrl }}
                    style={[styles.image, it.wornOut && styles.imageDim]}
                  />

                  {it.isDirty && (
                    <View style={styles.dirtyBadge}>
                      <Droplet size={18} color="#1E90FF" />
                    </View>
                  )}

                  {it.wornOut && (
                    <>
                      <View style={styles.wornOutVeil} />
                      <View style={styles.wornOutPill}>
                        <Text style={styles.wornOutPillText}>Worn-out</Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {it.subcategoryName}
                    {it.styleName ? ` - ${it.styleName}` : ""}
                  </Text>
                  <Text style={styles.cardSub}>{it.locationName || "—"}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
  },
  title: { fontSize: 20, fontFamily: "Inter-SemiBold", color: "#333333" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  card: {
    width: itemWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardInfo: { padding: 12 },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#333333",
    marginBottom: 4,
  },
  cardSub: { fontSize: 14, fontFamily: "Inter-Regular", color: "#666666" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666666",
    textAlign: "center",
  },
  errorText: { color: "#FF4444", fontSize: 14, fontFamily: "Inter-Regular" },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  imageDim: { opacity: 0.55 },
  dirtyBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  wornOutVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  wornOutPill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
  },
  wornOutPillText: {
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
