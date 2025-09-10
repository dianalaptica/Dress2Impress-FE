import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { LOGIN_URL } from "../lib/api";

const { width } = Dimensions.get("window");

interface LoginCardProps {
  onLogin: () => void;
}

type AuthResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
};

export default function LoginCard({ onLogin }: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (v: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) return "Email is required";
    if (!emailRegex.test(v)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (v: string) => {
    if (!v) return "Password is required";
    if (v.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleLogin = async () => {
    setFormError("");
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    try {
      setIsLoading(true);

      const resp = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
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
          data?.detail ||
          data?.message ||
          (resp.status === 400
            ? "Invalid email or password."
            : `Login failed (${resp.status}).`);
        setFormError(msg);
        return;
      }

      const auth = data as AuthResponse;
      const jwt = (auth as any).token ?? (auth as any).Token;
      if (!jwt) {
        setFormError("Login succeeded but no token returned.");
        return;
      }

      await SecureStore.setItemAsync("accessToken", jwt);
      await SecureStore.setItemAsync(
        "user",
        JSON.stringify({
          id: auth.id,
          firstName: auth.firstName,
          lastName: auth.lastName,
          email: auth.email,
        })
      );

      onLogin?.();
    } catch (e: any) {
      setFormError("Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Heart color="#FF69B4" size={32} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your fashion world</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Email address"
                  placeholderTextColor="#B0B0B0"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) setEmailError("");
                    if (formError) setFormError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {!!emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#B0B0B0"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (passwordError) setPasswordError("");
                    if (formError) setFormError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff color="#B0B0B0" size={20} />
                  ) : (
                    <Eye color="#B0B0B0" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {!!passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>

            {!!formError && (
              <Text style={[styles.errorText, { textAlign: "center" }]}>
                {formError}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading ? styles.loginButtonDisabled : null,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: width - 40, maxWidth: 400 },
  blurContainer: { borderRadius: 24, overflow: "hidden" },
  card: { padding: 32, backgroundColor: "rgba(255, 255, 255, 0.15)" },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  form: { marginBottom: 24 },
  inputContainer: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333333",
    paddingVertical: 16,
    paddingRight: 40,
  },
  inputError: { backgroundColor: "rgba(255, 182, 193, 0.9)" },
  eyeIcon: { position: "absolute", right: 16, padding: 4 },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 8,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: { backgroundColor: "#FFB6C1", opacity: 0.7 },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  signUpText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter-SemiBold" },
});
