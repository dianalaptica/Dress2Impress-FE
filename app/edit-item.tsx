import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  DollarSign,
  MapPin,
  Palette,
  Tag,
  Play,
  CalendarCheck,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { api } from "../lib/api";

export default function EditItemScreen() {
  const params = useLocalSearchParams();
  const itemId = useMemo(() => Number(params.id), [params.id]);
  const [isDirty, setIsDirty] = useState(params.isDirty === "true");
  const [wornOut, setWornOut] = useState(params.wornOut === "true");
  const originalIsDirty = params.isDirty === "true";
  const originalWornOut = params.wornOut === "true";
  const [numberOfWears, setNumberOfWears] = useState(
    Number(params.numberOfWears ?? 0)
  );
  const [lastWoreDate, setLastWoreDate] = useState<string | null>(
    (params.lastWoreDate as string) ?? null
  );
  const [saving, setSaving] = useState(false);
  const [wearing, setWearing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = isDirty !== originalIsDirty || wornOut !== originalWornOut;
    setHasChanges(changed);
  }, [isDirty, wornOut, originalIsDirty, originalWornOut]);

  const handleBack = () => router.back();

  const handleSave = async () => {
    if (!hasChanges || !itemId) return;
    const payload = {
      isDirty: isDirty !== originalIsDirty ? isDirty : null,
      wornOut: wornOut !== originalWornOut ? wornOut : null,
    };
    if (payload.isDirty === null && payload.wornOut === null) return;

    try {
      setSaving(true);
      const res = await api.patch(`/clothingitems/${itemId}/flags`, payload);

      const data = res.data ?? {};
      setIsDirty(Boolean(data.isDirty));
      setWornOut(Boolean(data.wornOut));
      if (typeof data.numberOfWears === "number") {
        setNumberOfWears(data.numberOfWears);
      }
      if (typeof data.lastWoreDate === "string" || data.lastWoreDate === null) {
        setLastWoreDate(data.lastWoreDate);
      }

      Alert.alert("Success", "Item updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Update failed.";
      Alert.alert("Error", String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleWearNow = async () => {
    if (!itemId) return;

    try {
      setWearing(true);
      const res = await api.post(`/clothingitems/${itemId}/wear-now`, {});
      const data = res.data ?? {};

      if (typeof data.numberOfWears === "number") {
        setNumberOfWears(data.numberOfWears);
      }
      if (typeof data.lastWoreDate === "string" || data.lastWoreDate === null) {
        setLastWoreDate(data.lastWoreDate);
      }

      Alert.alert("Wear Now", "Item marked as worn today!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Wear action failed.";
      Alert.alert("Error", String(msg));
    } finally {
      setWearing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#FF69B4" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Item</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: params.imageUrl as string }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Item Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Details</Text>

            {/* Price */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <DollarSign color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>
                  ${params.price} - Cost Per Wear: $
                  {(Number(params.price) / (numberOfWears || 1)).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {params.locationName || "Not specified"}
                </Text>
              </View>
            </View>

            {/* Color */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Palette color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>
                  {params.colourName || "Not specified"}
                </Text>
              </View>
            </View>

            {/* Category */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Tag color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{params.subcategoryName}</Text>
              </View>
            </View>

            {/* Number of Wears */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Play color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Number of Wears</Text>
                <Text style={styles.detailValue}>{numberOfWears}</Text>
              </View>
            </View>

            {/* Last Worn On */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <CalendarCheck color="#FF69B4" size={20} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Wore On</Text>
                <Text style={styles.detailValue}>
                  {lastWoreDate != null ? lastWoreDate : "Never worn"}
                </Text>
              </View>
            </View>
          </View>

          {/* Editable Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>

            {/* Is Dirty Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Is Dirty</Text>
                <Text style={styles.toggleDescription}>
                  Mark if this item needs washing
                </Text>
              </View>
              <Switch
                value={isDirty}
                onValueChange={setIsDirty}
                trackColor={{ false: "#E0E0E0", true: "#FFB6C1" }}
                thumbColor={isDirty ? "#FF69B4" : "#FFFFFF"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            {/* Worn Out Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Worn Out</Text>
                <Text style={styles.toggleDescription}>
                  Mark if this item is no longer wearable
                </Text>
              </View>
              <Switch
                value={wornOut}
                onValueChange={setWornOut}
                trackColor={{ false: "#E0E0E0", true: "#FFB6C1" }}
                thumbColor={wornOut ? "#FF69B4" : "#FFFFFF"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.wearNowButton, wearing && { opacity: 0.7 }]}
              onPress={handleWearNow}
              disabled={wearing}
            >
              <Text style={styles.wearNowButtonText}>
                {wearing ? "Updating..." : "Wear Now"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || saving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || saving}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!hasChanges || saving) && styles.saveButtonTextDisabled,
                ]}
              >
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 12,
  },
  imageContainer: {
    width: "65%",
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#666666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333333",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 32,
  },
  wearNowButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  wearNowButtonText: {
    color: "#666666",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#FF69B4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  saveButtonTextDisabled: {
    color: "#B0B0B0",
  },
});
