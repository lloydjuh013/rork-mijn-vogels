import { Tabs } from "expo-router";
import React from "react";
import { Bird, Home, Users, Calendar, Settings } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.border,
        },
        headerShown: false,
        tabBarShowLabel: false,
        headerTitle: "",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="birds"
        options={{
          title: "Vogels",
          headerShown: false,
          tabBarIcon: ({ color }) => <Bird color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="couples"
        options={{
          title: "Koppels",
          headerShown: false,
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="aviaries"
        options={{
          title: "Kooien",
          headerShown: false,
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Instellingen",
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}