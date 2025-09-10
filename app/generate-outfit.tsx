import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ChevronDown, Palette, Sparkles } from "lucide-react-native";
import { router } from "expo-router";
import { api, API_BASE } from "../lib/api";

type OutfitItemResponse = {
  imageUrl: string;
  position: number | null;
  clothingItemId?: number | null;
};

const STYLES = [
  { id: 1, name: "Casual" },
  { id: 2, name: "Business" },
  { id: 3, name: "Sport" },
  { id: 4, name: "Elegant" },
  { id: 5, name: "Formal" },
  { id: 6, name: "Evening" },
  { id: 7, name: "Party" },
  { id: 8, name: "Vintage" },
];

export default function GenerateOutfitScreen() {
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [selectedStyleName, setSelectedStyleName] = useState<string>("");
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [topUrl, setTopUrl] = useState<string | null>(null);
  const [bottomUrl, setBottomUrl] = useState<string | null>(null);
  const [shoesUrl, setShoesUrl] = useState<string | null>(null);
  const [topId, setTopId] = useState<number | null>(null);
  const [bottomId, setBottomId] = useState<number | null>(null);
  const [shoesId, setShoesId] = useState<number | null>(null);
  const [showAcceptBox, setShowAcceptBox] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => router.back();

  const normalizeUrl = (u?: string | null) =>
    u && u.startsWith("http") ? u : `${API_BASE}${u ?? ""}`;

  const handleGenerate = async () => {
    if (!selectedStyleId) {
      Alert.alert("Style Required", "Please select a style before generating.");
      return;
    }

    setIsGenerating(true);
    setNotFound(false);
    setShowAcceptBox(false);
    setOutfitName("");

    try {
      const res = await api.post<OutfitItemResponse[]>("/outfits/generate", {
        styleId: selectedStyleId,
      });

      const items = Array.isArray(res.data) ? res.data : [];
      if (items.length === 0) {
        setTopUrl(null);
        setBottomUrl(null);
        setShoesUrl(null);
        setTopId(null);
        setBottomId(null);
        setShoesId(null);
        setNotFound(true);
        return;
      }

      const top = items.find((i) => i.position === 1);
      const bottom = items.find((i) => i.position === 2);
      const shoes = items.find((i) => i.position === 3);

      setTopUrl(normalizeUrl(top?.imageUrl ?? null));
      setBottomUrl(normalizeUrl(bottom?.imageUrl ?? null));
      setShoesUrl(normalizeUrl(shoes?.imageUrl ?? null));
      setTopId(top?.clothingItemId ?? null);
      setBottomId(bottom?.clothingItemId ?? null);
      setShoesId(shoes?.clothingItemId ?? null);

      setNotFound(false);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to generate outfit.";
      Alert.alert("Error", String(msg));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Outfit",
      "Rejecting will discard this outfit and generate a new one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setTopUrl(null);
            setBottomUrl(null);
            setShoesUrl(null);
            setTopId(null);
            setBottomId(null);
            setShoesId(null);
            setShowAcceptBox(false);
            setOutfitName("");
            await handleGenerate();
          },
        },
      ]
    );
  };

  const handleWearOutfit = () => {
    setShowAcceptBox(true);
  };

  const handleSaveAcceptedOutfit = async () => {
    const name = outfitName.trim();
    if (!name) return;

    if (!topId || !bottomId || !shoesId) {
      Alert.alert("Error", "This outfit is incomplete. Please generate again.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post("/outfits/accept", {
        outfitName: name,
        items: [
          { clothingItemId: topId, position: 1 },
          { clothingItemId: bottomId, position: 2 },
          { clothingItemId: shoesId, position: 3 },
        ],
      });

      Alert.alert(
        "Success",
        "Outfit saved!",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)/outfits");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to save outfit.";
      Alert.alert("Error", String(msg));
    } finally {
      setIsSaving(false);
    }
  };

  const hasOutfit = !!topUrl || !!bottomUrl || !!shoesUrl;
  const canSave = outfitName.trim().length > 0 && !isSaving;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#FF69B4" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Generate Outfit</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Style Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStyleDropdown(!showStyleDropdown)}
            >
              <Palette color="#FF69B4" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.dropdownText,
                  !selectedStyleId && styles.placeholderText,
                ]}
              >
                {selectedStyleName || "Select style"}
              </Text>
              <ChevronDown color="#B0B0B0" size={20} />
            </TouchableOpacity>
            {showStyleDropdown && (
              <View style={styles.dropdownList}>
                {STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedStyleId(style.id);
                      setSelectedStyleName(style.name);
                      setShowStyleDropdown(false);
                      setNotFound(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{style.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Generate Button */}
          {!hasOutfit && !isGenerating && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate}
            >
              <Sparkles color="#FFFFFF" size={24} />
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
          )}
          {isGenerating && (
            <View
              style={[styles.generateButton, styles.generateButtonDisabled]}
            >
              <ActivityIndicator color="#fff" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </View>
          )}

          {/* No result state */}
          {notFound && (
            <View style={{ marginTop: 24, alignItems: "center" }}>
              <Text style={styles.noResultTitle}>
                No combination found for the selected style.
              </Text>
              <Text style={styles.noResultSubtitle}>
                Try a different style or add more items to your collection.
              </Text>
              <TouchableOpacity
                style={[styles.wearButton, { marginTop: 16 }]}
                onPress={() => router.push("/add-item")}
              >
                <Text style={styles.wearButtonText}>Add Items</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Generated Outfit */}
          {hasOutfit && (
            <View style={styles.outfitContainer}>
              <Text style={styles.outfitTitle}>
                Your {selectedStyleName} Outfit
              </Text>

              <View style={styles.outfitCard}>
                {/* Top */}
                <View style={styles.imageContainer}>
                  <Text style={styles.imageLabel}>Top</Text>
                  {topUrl ? (
                    <Image
                      source={{ uri: topUrl }}
                      style={styles.itemImageTop}
                    />
                  ) : (
                    <View style={[styles.itemImageTop, { opacity: 0.3 }]} />
                  )}
                </View>

                {/* Bottom */}
                <View style={styles.imageContainer}>
                  <Text style={styles.imageLabel}>Bottom</Text>
                  {bottomUrl ? (
                    <Image
                      source={{ uri: bottomUrl }}
                      style={styles.itemImageBottom}
                    />
                  ) : (
                    <View style={[styles.itemImageBottom, { opacity: 0.3 }]} />
                  )}
                </View>

                {/* Shoes */}
                <View style={styles.imageContainer}>
                  <Text style={styles.imageLabel}>Shoes</Text>
                  {shoesUrl ? (
                    <Image
                      source={{ uri: shoesUrl }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={[styles.itemImage, { opacity: 0.3 }]} />
                  )}
                </View>
              </View>

              {showAcceptBox && (
                <View style={styles.acceptBox}>
                  <Text style={styles.acceptLabel}>Outfit name</Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="e.g. Weekend Casual"
                    placeholderTextColor="#B0B0B0"
                    value={outfitName}
                    onChangeText={setOutfitName}
                  />
                  <TouchableOpacity
                    style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                    onPress={handleSaveAcceptedOutfit}
                    disabled={!canSave}
                  >
                    <Text style={styles.saveBtnText}>
                      {isSaving ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.wearButton}
                  onPress={handleWearOutfit}
                >
                  <Text style={styles.wearButtonText}>Wear Outfit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  gradient: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: { padding: 8, backgroundColor: "#FFF0F5", borderRadius: 12 },
  title: { fontSize: 20, fontFamily: "Inter-SemiBold", color: "#333333" },
  placeholder: { width: 40 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  section: { marginVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputIcon: { marginRight: 12 },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
  },
  placeholderText: { color: "#B0B0B0" },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 18,
    marginVertical: 32,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: "#FFB6C1",
    opacity: 0.8,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginLeft: 8,
  },
  outfitContainer: { marginTop: 24 },
  outfitTitle: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  outfitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 24,
  },
  imageContainer: { marginBottom: 16 },
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
  acceptBox: {
    backgroundColor: "#FFF0F5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    padding: 16,
    marginBottom: 16,
  },
  acceptLabel: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#FF69B4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#FFB6C1",
    opacity: 0.8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  actionButtons: { flexDirection: "row", gap: 12, marginBottom: 32 },
  rejectButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rejectButtonText: {
    color: "#666666",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  wearButton: {
    flex: 1,
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  noResultTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    textAlign: "center",
  },
  noResultSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666666",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 24,
  },
});
