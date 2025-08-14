import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import ButtonComponent from "@/components/ButtonComponent";
import { Colors } from "@/constants/Colors";
import { getApiUrl, API_CONFIG } from "@/constants/ApiConfig";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { router } from "expo-router";

export default function Page() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Basic validation
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SIGNUP), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          email: email,
          password: password,
          phone_number: phoneNumber,
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", data.message, [
          {
            text: "OK",
            onPress: () => router.navigate("/login"),
          },
        ]);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/image.png")}
      resizeMode="cover"
      style={styles.Container}
    >
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <FontAwesome6 name="user-plus" size={35} color={Colors.light.primary} />
        <Text
          style={{
            fontSize: 30,
            fontWeight: "bold",
            color: Colors.light.primary,
          }}
        >
          Sign Up
        </Text>
      </View>

      {/* Username Input */}
      <View style={styles.TextInputStyle}>
        <FontAwesome name="user" size={24} color="grey" />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.inputText}
          autoCapitalize="none"
        />
      </View>

      {/* Email Input */}
      <View style={styles.TextInputStyle}>
        <MaterialCommunityIcons name="email-outline" size={24} color="grey" />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.inputText}
        />
      </View>

      {/* Password Input */}
      <View style={styles.TextInputStyle}>
        <Feather name="lock" size={24} color="grey" />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          style={styles.inputText}
        />
      </View>

      {/* Phone Number Input */}
      <View style={styles.TextInputStyle}>
        <FontAwesome name="phone" size={24} color="grey" />
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.inputText}
        />
      </View>

      {/* Signup Button */}
      <ButtonComponent 
        text={loading ? "Creating Account..." : "Sign Up"} 
        bordered={false} 
        onPress={handleSignUp}
        disabled={loading}
      />

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.navigate("/login")}>
          <Text style={styles.signupLink}>Login</Text>
        </TouchableOpacity>
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
  TextInputStyle: {
    width: "100%",
    height: 50,
    borderColor: Colors.light.primary,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  inputText: {
    color: "grey",
    width: "90%",
    paddingHorizontal: 10,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "grey",
    fontSize: 16,
  },
  signupLink: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
