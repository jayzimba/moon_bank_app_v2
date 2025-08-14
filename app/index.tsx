import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // If user is already authenticated, redirect to home after animations
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 2000); // Give time for animations to complete
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, fadeAnim, slideAnim, scaleAnim]);

  const handleLogin = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.navigate("/login");
    });
  };

  const handleSignUp = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.navigate("/signup");
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
      
      <LinearGradient
        colors={['#44CDFB', '#04a7de', Colors.light.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(20)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.patternDot,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: Math.random() * 0.3 + 0.1,
                },
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoBackground}>
                <FontAwesome6
                  name="money-bill-trend-up"
                  size={60}
                  color="white"
                />
              </View>
            </Animated.View>
            
            <Animated.Text
              style={[
                styles.title,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              MoonBank
            </Animated.Text>
            
            <Animated.Text
              style={[
                styles.subtitle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Your trusted financial partner
            </Animated.Text>
            
            <Animated.Text
              style={[
                styles.description,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Join our community banking platform for secure savings, loans, and financial growth
            </Animated.Text>
          </View>

          {/* Features Section */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.featureItem}>
              <MaterialIcons name="security" size={24} color="white" />
              <Text style={styles.featureText}>Secure & Safe</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="trending-up" size={24} color="white" />
              <Text style={styles.featureText}>Grow Together</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="support-agent" size={24} color="white" />
              <Text style={styles.featureText}>24/7 Support</Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <FontAwesome6 name="user-plus" size={18} color="white" />
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.footerText}>
              Trusted by thousands of users across Zambia
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  patternDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 40,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  versionText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
});
