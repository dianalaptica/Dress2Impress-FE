import React from "react";
import {
  StyleSheet,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import SignupCard, { SignUpPayload } from "../components/SignupCard";
import { REGISTER_URL } from "../lib/api";
import * as SecureStore from "expo-secure-store";

const { height } = Dimensions.get("window");

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBack = () => router.back();

  const handleSignUp = async (payload: SignUpPayload) => {
    try {
      setIsLoading(true);

      const resp = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = await resp.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!resp.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (resp.status === 400
            ? "User with this email already exists."
            : `Register failed (${resp.status})`);
        alert(msg);
        return;
      }

      const auth = data as {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        token: string;
      };

      await SecureStore.setItemAsync("accessToken", auth.token);
      await SecureStore.setItemAsync(
        "user",
        JSON.stringify({
          id: auth.id,
          firstName: auth.firstName,
          lastName: auth.lastName,
          email: auth.email,
        })
      );

      router.replace("/(tabs)");
    } catch (e) {
      alert("Could not reach server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(255,182,193,0.6)",
          "rgba(255,105,180,0.7)",
          "rgba(248,187,217,0.8)",
        ]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>

            <SignupCard
              onBack={handleBack}
              onSignUp={handleSignUp}
              isSubmitting={isLoading}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
});
