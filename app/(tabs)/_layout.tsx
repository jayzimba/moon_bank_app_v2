import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import { FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="house"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
            name="users"
            size={24}
            color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statements"
        options={{
          title: "Statements",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="file-document"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: "Loans",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="money-bill-transfer"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="person"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
