import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { api, API_BASE } from "../../lib/api";
import { Droplet } from "lucide-react-native";

const { width } = Dimensions.get("window");
const itemWidth = (width - 60) / 2;

const CATEGORIES = [
  { id: 1, label: "Tops" },
  { id: 2, label: "Bottoms" },
  { id: 3, label: "Shoes" },
];

type ClothingItemResponse = {
  id: number;
  imageUrl: string;
  price: number;
  subcategoryId: number;
  subcategoryName: string;
  isDirty: boolean;
  wornOut: boolean;
  numberOfWears: number;
  colourId?: number | null;
  locationId?: number | null;
  styleId?: number | null;
  colourName?: string | null;
  locationName?: string | null;
  styleName?: string | null;
};

export default function HomeScreen() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [topItems, setTopItems] = useState<ClothingItemResponse[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setFirstName(parsed.firstName ?? null);
        }
      } catch (e) {
        console.warn("Could not load user", e);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchTopWorn = async () => {
      try {
        setLoadingTop(true);
        setTopError(null);
        const res = await api.get<ClothingItemResponse[]>(
          "/clothingitems/top-worn?limit=4"
        );
        const data = (res.data ?? []).map((it) => ({
          ...it,
          imageUrl: it.imageUrl?.startsWith("http")
            ? it.imageUrl
            : `${API_BASE}${it.imageUrl ?? ""}`,
        }));
        setTopItems(data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to load most worn items.";
        setTopError(String(msg));
        setTopItems([]);
      } finally {
        setLoadingTop(false);
      }
    };

    fetchTopWorn();
  }, []);

  const goToCategory = (categoryId: number, label: string) => {
    router.push({
      pathname: "/category-items",
      params: { categoryId: String(categoryId), label },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {firstName ? `Hello, ${firstName}!` : "Hello Beautiful!"}
            </Text>
            <Text style={styles.subGreeting}>Find your perfect style</Text>
          </View>
        </View>

        {/* Subtitle */}
        <LinearGradient
          colors={["#FFB6C1", "#FF69B4"]}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>What will you wear today?</Text>
          <Text style={styles.heroSubtitle}>Generate your new outfit!</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/generate-outfit")}
          >
            <Text style={styles.shopButtonText}>Generate Now</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.categoryItem}
                  onPress={() => goToCategory(c.id, c.label)}
                >
                  <Text style={styles.categoryText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Most Worn Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn Items</Text>

          {loadingTop ? (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : topError ? (
            <Text style={{ color: "#FF4444", marginTop: 8 }}>{topError}</Text>
          ) : topItems.length === 0 ? (
            <Text style={{ marginTop: 8, color: "#666666" }}>
              No data yet — start adding and wearing your items.
            </Text>
          ) : (
            <View style={styles.itemsGrid}>
              {topItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={[
                        styles.itemImage,
                        item.wornOut && styles.itemImageDim,
                      ]}
                    />

                    {item.isDirty && (
                      <View style={styles.dirtyBadge}>
                        <Droplet size={18} color="#1E90FF" />
                      </View>
                    )}

                    {item.wornOut && (
                      <>
                        <View style={styles.wornOutVeil} />
                        <View style={styles.wornOutPill}>
                          <Text style={styles.wornOutPillText}>Worn-out</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {item.subcategoryName}
                      {item.styleName ? ` - ${item.styleName}` : ""}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {item.locationName || "—"} • {item.numberOfWears} wears
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: { fontSize: 24, fontFamily: "Inter-Bold", color: "#333333" },
  subGreeting: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginTop: 4,
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
  },
  categoriesContainer: { flexDirection: "row", gap: 12 },
  categoryItem: {
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFB6C1",
  },
  categoryText: { fontSize: 14, fontFamily: "Inter-Medium", color: "#FF69B4" },
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
  },
  itemImage: {
    width: "100%",
    height: 200,
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
  itemSubtitle: { fontSize: 14, fontFamily: "Inter-Regular", color: "#666666" },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  itemImageDim: { opacity: 0.55 },
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
