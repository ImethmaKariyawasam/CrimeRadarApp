import { View, Text, Image } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import useUser from "@/hooks/useUser";

export default function TabsLayout() {
  const { user } = useUser();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color,focused }) => {
          let iconName;
          if (route.name === "index") {
            iconName =
              require("@/assets/icons/HouseSimple.png");
          }else if(route.name === "search/index"){
            iconName = require("@/assets/icons/mapiconnew.png");
          }else if(route.name === "notices/index"){
            iconName = require("@/assets/icons/BookBookmark.png");
          }
          else if(route.name === "article/index"){
            iconName = require("@/assets/icons/article.png");
          }
          else if(route.name === "profile/index"){
            iconName = user?.avatar ? { uri: user?.avatar } : require("@/assets/icons/User.png");
          }
          const iconColor = focused ? "red" : "gray";
          return <Image
          style={{ width: 24, height: 24,tintColor: iconColor }}
          source={iconName}
          />;
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search/index" />
      <Tabs.Screen name="notices/index" />
      <Tabs.Screen name="article/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}
