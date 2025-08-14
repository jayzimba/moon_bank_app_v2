import {
  Button,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect } from "react";
import ButtonComponent from "@/components/ButtonComponent";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";

export default function IndexScreen() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // If user is already authenticated, redirect to home after a short delay
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 100); // Small delay to ensure layout is mounted
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  return (
    <ImageBackground
      source={require("../assets/images/image.png")}
      resizeMode="cover"
      style={styles.Container}
    >
      <View style={{ alignItems: "center", marginBottom: 50 }}>
        <FontAwesome6
          name="money-bill-trend-up"
          size={50}
          color={Colors.light.primary}
        />
        <Text
          style={{
            fontSize: 35,
            fontWeight: "bold",
            color: Colors.light.primary,
            marginTop: 10,
          }}
        >
          MoonBank
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "grey",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          Your trusted financial partner
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonComponent
          text="Login"
          bordered={false}
          onPress={() => router.navigate("/login")}
        />

        <ButtonComponent
          text="Sign Up"
          bordered={true}
          onPress={() => router.navigate("/signup")}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
});
