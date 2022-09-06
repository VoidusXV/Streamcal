import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import { backgroundColor } from "./components/constants/Colors";
//Screens
import MainScreen from "./screens/MainScreen";
import ViewContent from "./screens/ViewContent";
import MediaScreen from "./screens/MediaScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={"light-content"} backgroundColor={backgroundColor}></StatusBar>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainScreen" component={MainScreen}></Stack.Screen>
          <Stack.Screen name="ViewContent" component={ViewContent}></Stack.Screen>
          <Stack.Screen name="MediaScreen" component={MediaScreen}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
