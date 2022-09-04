import React from "react";
import { StatusBar, SafeAreaView } from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import useCachedResources from "./hooks/useCachedResources";

//Screens
import HomeScreen from "./screens/HomeScreen";
import ListScreen from "./screens/ListScreen";
import AccountPage from "./screens/AccountScreen";

import { NavigationContainer } from "@react-navigation/native";

import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const isFocused = (focused: any) => {
  return focused ? "#5a82cc" : "#999999";
};

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={"light-content"} backgroundColor={"#101724"}></StatusBar>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: { backgroundColor: "#101724" },
              // tabBarIconStyle: { color: "white" },
              tabBarLabelStyle: { color: "white" },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <Ionicons name="ios-home-outline" size={24} color={isFocused(focused)}></Ionicons>
                ),
              }}
            ></Tab.Screen>
            <Tab.Screen
              name="Liste"
              component={ListScreen}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <FontAwesome name="bookmark-o" size={24} color={isFocused(focused)}></FontAwesome>
                ),
              }}
            ></Tab.Screen>
            <Tab.Screen
              name="Konto"
              component={AccountPage}
              options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={24}
                    color={isFocused(focused)}
                  ></MaterialCommunityIcons>
                ),
              }}
            ></Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}
