import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search as SearchIcon, Plus, Droplet } from "lucide-react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { api, API_BASE } from "../../lib/api";

const { width } = Dimensions.get("window");
const itemWidth = (width - 60) / 2; // 20 padding left + 20 padding right + 20 gap ≈ 60

type ClothingItemResponse = {
  id: number;
  imageUrl: string;
  price: number;
  subcategoryId: number;
  isDirty: boolean;
  wornOut: boolean;
  numberOfWears: number;
  colourId: number | null;
  locationId: number | null;
  styleId: number | null;
  colourName?: string | null;
  locationName?: string | null;
  styleName?: string | null;
  subcategoryName: string;
  lastWoreDate?: string | null;
};

export default function ItemsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ClothingItemResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ClothingItemResponse[]>("/clothingitems/all");
      const base = (api.defaults.baseURL ?? "").replace(/\/+$/, "");
      const normalized = res.data.map((it) => ({
        ...it,
        imageUrl: API_BASE + (it.imageUrl ?? ""),
      }));
      setItems(normalized);
    } catch (e) {
      console.warn("[ITEMS] fetch failed", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const title = `${it.subcategoryName ?? ""} - ${
        it.styleName ?? ""
      }`.toLowerCase();
      const loc = (it.locationName ?? "").toLowerCase();
      return title.includes(q) || loc.includes(q);
    });
  }, [items, searchQuery]);

  const hasItems = filtered.length > 0;

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
      {/* Header */}
      <Text style={styles.title}>My Items</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchIcon color="#B0B0B0" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your items..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add New Item Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-item")}
      >
        <Plus color="#FFFFFF" size={24} />
        <Text style={styles.addButtonText}>Add New Item</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>{items.length} items</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : hasItems ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.itemsGrid}>
            {filtered.map((item) => {
              const title = `${item.subcategoryName ?? ""} - ${
                item.styleName ?? ""
              }`;
              const subtitle = item.locationName ?? "";
              const isUnavailable = item.wornOut;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isUnavailable && styles.cardDisabled,
                  ]}
                  onPress={() => handleItemPress(item)}
                  accessibilityLabel={`${title}${
                    isUnavailable ? " (worn-out)" : ""
                  }${item.isDirty ? " (dirty)" : ""}`}
                >
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={[
                        styles.itemImage,
                        isUnavailable && styles.itemImageDim,
                      ]}
                      resizeMode="cover"
                    />

                    {item.isDirty && (
                      <View style={styles.dirtyBadge}>
                        <Droplet size={18} color="#1E90FF" />
                      </View>
                    )}

                    {isUnavailable && (
                      <>
                        <View style={styles.wornOutVeil} />
                        <View style={styles.wornOutPill}>
                          <Text style={styles.wornOutPillText}>Worn-out</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text numberOfLines={1} style={styles.itemTitle}>
                      {title}
                    </Text>
                    <Text numberOfLines={1} style={styles.itemSubtitle}>
                      {subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first clothing item to get started
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#333333",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    marginTop: 2,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
    paddingVertical: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF69B4",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImageDim: {
    opacity: 0.55,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  cardDisabled: {
    shadowOpacity: 0.05,
    elevation: 1,
  },
});
