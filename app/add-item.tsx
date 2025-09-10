import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  MapPin,
  DollarSign,
  Tag,
  Palette,
} from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { api } from "../lib/api";

const COLORS = [
  { id: 1, name: "Red", value: "#FF0000" },
  { id: 2, name: "Blue", value: "#0000FF" },
  { id: 3, name: "Green", value: "#008000" },
  { id: 4, name: "Black", value: "#000000" },
  { id: 5, name: "White", value: "#FFFFFF" },
  { id: 6, name: "Yellow", value: "#FFFF00" },
  { id: 7, name: "Pink", value: "#FF69B4" },
  { id: 8, name: "Purple", value: "#800080" },
  { id: 9, name: "Orange", value: "#FFA500" },
  { id: 10, name: "Brown", value: "#A52A2A" },
  { id: 11, name: "Gray", value: "#808080" },
  { id: 12, name: "Beige", value: "#F5F5DC" },
  { id: 13, name: "Navy", value: "#000080" },
  { id: 14, name: "Olive", value: "#808000" },
  { id: 15, name: "Burgundy", value: "#800020" },
];

const LOCATIONS = [
  { id: 1, name: "Wardrobe 1" },
  { id: 2, name: "Wardrobe 2" },
  { id: 3, name: "Drawer Chest" },
  { id: 4, name: "Shoe Rack" },
  { id: 5, name: "Coat Hanger" },
  { id: 6, name: "Storage Box" },
];

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

const SUBCATEGORIES = [
  // Tops (CategoryId=1)
  { id: 1, name: "T-Shirts" },
  { id: 2, name: "Shirts" },
  { id: 3, name: "Blouses" },
  { id: 4, name: "Sweaters" },
  { id: 5, name: "Jackets" },
  // Bottoms (CategoryId=2)
  { id: 6, name: "Jeans" },
  { id: 7, name: "Trousers" },
  { id: 8, name: "Shorts" },
  { id: 9, name: "Skirts" },
  // Shoes (CategoryId=3)
  { id: 10, name: "Sneakers" },
  { id: 11, name: "Boots" },
  { id: 12, name: "Heels" },
  { id: 13, name: "Sandals" },
];

export default function AddItemScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    image: "",
    price: "",
    subcategory: "",
    color: "",
    location: "",
    style: "",
  });

  async function getBase64FromUri(photoUri: string) {
    try {
      const base64Img = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Img;
    } catch {
      console.log("Reading the profile image file failed");
      return null;
    }
  }

  const handleBack = () => router.back();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const x = await getBase64FromUri(result.assets[0].uri);
      setImageBase64(x);
      if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      image: "",
      price: "",
      subcategory: "",
      color: "",
      location: "",
      style: "",
    };

    if (!price) newErrors.price = "Price is required";
    else if (isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = "Please enter a valid price";
    if (!selectedSubcategoryId)
      newErrors.subcategory = "Please select a subcategory";
    if (!selectedColorId) newErrors.color = "Please select a color";
    if (!selectedLocationId) newErrors.location = "Please select a location";
    if (!selectedStyleId) newErrors.style = "Please select a style";

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!imageBase64) {
      setErrors((prev) => ({ ...prev, image: "Please add an image" }));
      return;
    }

    try {
      const payload = {
        base64Image: imageBase64,
        price: Number(price),
        subcategoryId: selectedSubcategoryId!,
        colourId: selectedColorId!,
        locationId: selectedLocationId!,
        styleId: selectedStyleId!,
      };

      const res = await api.post("/clothingitems/add", payload);
      console.log("[ADD ITEM] created:", res.data);

      Alert.alert("Success", "Item added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to add item";
      Alert.alert("Error", String(msg));
    }
  };

  const subcatLabel = selectedSubcategoryId
    ? SUBCATEGORIES.find((s) => s.id === selectedSubcategoryId)?.name
    : "";
  const colorLabel = selectedColorId
    ? COLORS.find((c) => c.id === selectedColorId)?.name
    : "";
  const locationLabel = selectedLocationId
    ? LOCATIONS.find((l) => l.id === selectedLocationId)?.name
    : "";
  const styleLabel = selectedStyleId
    ? STYLES.find((s) => s.id === selectedStyleId)?.name
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#FF69B4" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Item</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera color="#FF69B4" size={48} />
                  <Text style={styles.imagePlaceholderText}>
                    Tap to add photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {!!errors.image && (
              <Text style={styles.errorText}>{errors.image}</Text>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.inputWrapper}>
              <DollarSign color="#FF69B4" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                placeholder="Enter price"
                placeholderTextColor="#B0B0B0"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  if (errors.price)
                    setErrors((prev) => ({ ...prev, price: "" }));
                }}
                keyboardType="numeric"
              />
            </View>
            {!!errors.price && (
              <Text style={styles.errorText}>{errors.price}</Text>
            )}
          </View>

          {/* Subcategory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subcategory</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                errors.subcategory ? styles.inputError : null,
              ]}
              onPress={() => {
                setShowSubcategoryDropdown(!showSubcategoryDropdown);
                setShowColorDropdown(false);
                setShowLocationDropdown(false);
                setShowStyleDropdown(false);
              }}
            >
              <Tag color="#FF69B4" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.dropdownText,
                  !selectedSubcategoryId && styles.placeholderText,
                ]}
              >
                {subcatLabel || "Select subcategory"}
              </Text>
              <ChevronDown color="#B0B0B0" size={20} />
            </TouchableOpacity>
            {showSubcategoryDropdown && (
              <View style={styles.dropdownList}>
                {SUBCATEGORIES.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSubcategoryId(sub.id);
                      setShowSubcategoryDropdown(false);
                      if (errors.subcategory)
                        setErrors((prev) => ({ ...prev, subcategory: "" }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.subcategory && (
              <Text style={styles.errorText}>{errors.subcategory}</Text>
            )}
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <TouchableOpacity
              style={[styles.dropdown, errors.color ? styles.inputError : null]}
              onPress={() => {
                setShowColorDropdown(!showColorDropdown);
                setShowSubcategoryDropdown(false);
                setShowLocationDropdown(false);
                setShowStyleDropdown(false);
              }}
            >
              <Palette color="#FF69B4" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.dropdownText,
                  !selectedColorId && styles.placeholderText,
                ]}
              >
                {colorLabel || "Select color"}
              </Text>
              <ChevronDown color="#B0B0B0" size={20} />
            </TouchableOpacity>
            {showColorDropdown && (
              <View style={styles.dropdownList}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedColorId(c.id);
                      setShowColorDropdown(false);
                      if (errors.color)
                        setErrors((prev) => ({ ...prev, color: "" }));
                    }}
                  >
                    <View
                      style={[styles.colorCircle, { backgroundColor: c.value }]}
                    />
                    <Text style={styles.dropdownItemText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.color && (
              <Text style={styles.errorText}>{errors.color}</Text>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                errors.location ? styles.inputError : null,
              ]}
              onPress={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowSubcategoryDropdown(false);
                setShowColorDropdown(false);
                setShowStyleDropdown(false);
              }}
            >
              <MapPin color="#FF69B4" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.dropdownText,
                  !selectedLocationId && styles.placeholderText,
                ]}
              >
                {locationLabel || "Select location"}
              </Text>
              <ChevronDown color="#B0B0B0" size={20} />
            </TouchableOpacity>
            {showLocationDropdown && (
              <View style={styles.dropdownList}>
                {LOCATIONS.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLocationId(l.id);
                      setShowLocationDropdown(false);
                      if (errors.location)
                        setErrors((prev) => ({ ...prev, location: "" }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{l.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            <TouchableOpacity
              style={[styles.dropdown, errors.style ? styles.inputError : null]}
              onPress={() => {
                setShowStyleDropdown(!showStyleDropdown);
                setShowSubcategoryDropdown(false);
                setShowColorDropdown(false);
                setShowLocationDropdown(false);
              }}
            >
              <Tag color="#FF69B4" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.dropdownText,
                  !selectedStyleId && styles.placeholderText,
                ]}
              >
                {styleLabel || "Select style"}
              </Text>
              <ChevronDown color="#B0B0B0" size={20} />
            </TouchableOpacity>
            {showStyleDropdown && (
              <View style={styles.dropdownList}>
                {STYLES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedStyleId(s.id);
                      setShowStyleDropdown(false);
                      if (errors.style)
                        setErrors((prev) => ({ ...prev, style: "" }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.style && (
              <Text style={styles.errorText}>{errors.style}</Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Item</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 8,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
  },
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
  imageContainer: {
    width: "100%",
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#FFB6C1",
    borderStyle: "dashed",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  imagePlaceholderText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#FF69B4",
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
    paddingVertical: 16,
  },
  inputError: {
    borderColor: "#FF4444",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
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
    flexDirection: "row",
    alignItems: "center",
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
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 8,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginVertical: 32,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
});
