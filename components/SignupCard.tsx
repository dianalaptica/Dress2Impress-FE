import React from "react";
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
import { User, Mail, Lock, Eye, EyeOff, Heart } from "lucide-react-native";

const { width } = Dimensions.get("window");

export type SignUpPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type Props = {
  onSignUp?: (payload: SignUpPayload) => Promise<void> | void;
  onBack?: () => void;
  isSubmitting?: boolean;
};

export default function SignupCard({ onSignUp, onBack, isSubmitting }: Props) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localLoading, setLocalLoading] = React.useState(false);

  const loading = isSubmitting ?? localLoading;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

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

  const validateForm = () => {
    const next = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) next.email = "Email is required";
    else if (!emailRegex.test(email))
      next.email = "Please enter a valid email address";

    if (!password) next.password = "Password is required";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters";

    if (!confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!onSignUp) return;

    try {
      setLocalLoading(true);
      await onSignUp({ firstName, lastName, email, password });
    } finally {
      setLocalLoading(false);
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
            <Text style={styles.title}>Join Fashion World</Text>
            <Text style={styles.subtitle}>
              Create your account to get started
            </Text>
          </View>

          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    errors.firstName ? styles.inputError : null,
                  ]}
                  placeholder="First Name"
                  placeholderTextColor="#B0B0B0"
                  value={firstName}
                  onChangeText={(t) => {
                    setFirstName(t);
                    if (errors.firstName)
                      setErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {!!errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    errors.lastName ? styles.inputError : null,
                  ]}
                  placeholder="Last Name"
                  placeholderTextColor="#B0B0B0"
                  value={lastName}
                  onChangeText={(t) => {
                    setLastName(t);
                    if (errors.lastName)
                      setErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {!!errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    errors.email ? styles.inputError : null,
                  ]}
                  placeholder="Email address"
                  placeholderTextColor="#B0B0B0"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {!!errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    errors.password ? styles.inputError : null,
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#B0B0B0"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
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
              {!!errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock color="#FF69B4" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword ? styles.inputError : null,
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#B0B0B0"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((s) => !s)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#B0B0B0" size={20} />
                  ) : (
                    <Eye color="#B0B0B0" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {!!errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                loading ? styles.signUpButtonDisabled : null,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "center", width: width - 40, maxWidth: 400 },
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
  signUpButton: {
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
  signUpButtonDisabled: { backgroundColor: "#FFB6C1", opacity: 0.7 },
  signUpButtonText: {
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
  signInText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter-SemiBold" },
});
