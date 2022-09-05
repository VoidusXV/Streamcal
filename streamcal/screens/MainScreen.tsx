import React from "react";
import { StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import useCachedResources from "../hooks/useCachedResources";

//Screens
import HomeScreen from "./HomeScreen";
import ListScreen from "./ListScreen";
import AccountPage from "./AccountScreen";

import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

import { backgroundColor } from "../constants/Colors";

const Tab = createBottomTabNavigator();

const isFocused = (focused: any) => {
  return focused ? "#5a82cc" : "#999999";
};

export default function MainScreen() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: backgroundColor },
            tabBarLabelStyle: { color: "white" },
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <Ionicons name="ios-home-outline" size={24} color={isFocused(focused)}></Ionicons>
              ),
            }}></Tab.Screen>
          <Tab.Screen
            name="Liste"
            component={ListScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <FontAwesome name="bookmark-o" size={24} color={isFocused(focused)}></FontAwesome>
              ),
            }}></Tab.Screen>
          <Tab.Screen
            name="Konto"
            component={AccountPage}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={24}
                  color={isFocused(focused)}></MaterialCommunityIcons>
              ),
            }}></Tab.Screen>
        </Tab.Navigator>
      </>
    );
  }
}
