import React from "react";
import { Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import useCachedResources from "../hooks/useCachedResources";

//Screens
import HomeScreen from "./HomeScreen";
import ListScreen from "./ListScreen";
import SettingsScreen from "./SettingsScreen";

import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

import { backgroundColor } from "../components/constants/Colors";
import serverStatus, { eServer, IServerStatus } from "../hooks/serverStatus";
import { getServerData, VERSION } from "../backend/serverConnection";
import { WindowSize } from "../components/constants/Layout";
import SettingsButton from "../components/Designs/SettingsButton";
import ErrorView from "../components/Designs/ErrorView";

const Tab = createBottomTabNavigator();

const isFocused = (focused: any) => {
  return focused ? "#5a82cc" : "#999999";
};

function MainScreen() {
  //const isLoadingComplete = useCachedResources();
  let getServerStatus: IServerStatus = serverStatus();

  // console.log(getServerStatus);
  //__DEV__
  if (getServerStatus.Status != eServer.Online && !__DEV__) {
    return (
      <ErrorView
        ErrorText={"Master-Server is Offline, please try again later"}
        SettingsButtonParams={{
          ButtonText: "Retry",
          style: { justifyContent: "center" },
          onPress: () => console.log("first"),
        }}
      ></ErrorView>
    );
  } else if (getServerStatus.Version != VERSION && !__DEV__) {
    return (
      <ErrorView
        ErrorText={"There is an update available, please download the latest version"}
        SettingsButtonParams={{
          ButtonText: "Download...",
          style: { justifyContent: "center" },
          onPress: () => console.log("Download..."),
        }}
      ></ErrorView>
    );
  } else {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: backgroundColor },
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
            name="Lists"
            component={ListScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <FontAwesome name="bookmark-o" size={24} color={isFocused(focused)}></FontAwesome>
              ),
            }}
          ></Tab.Screen>
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
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
      </>
    );
  }
}

export default MainScreen;
