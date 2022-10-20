import React from "react";

import { StyleSheet } from "react-native";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { WindowSize } from "../components/constants/Layout";

import Downloads from "../components/SubPages/ListScreen/Downloads";
import History from "../components/SubPages/ListScreen/History";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

export default function ListScreen({ navigation }: any) {
  return (
    <Tab.Navigator
      style={{ backgroundColor: backgroundColor }}
      pagerStyle={{ backgroundColor: "white" }}
      backBehavior={"initialRoute"}
      screenOptions={{
        // tabBarIndicatorContainerStyle: {
        //   backgroundColor: "rgba(255,255,255,0.1)",
        // },
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderColor: "white",
        },
        tabBarLabelStyle: { fontWeight: "500" },
        tabBarIndicatorStyle: { backgroundColor: selectionColor },
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarActiveTintColor: "white",
        tabBarPressColor: "rgba(255,255,255,0.2)",
      }}
      sceneContainerStyle={{ backgroundColor: backgroundColor }}
    >
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Downloads" component={Downloads} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: "center",
    //justifyContent: "center",
    width: "100%",
    height: "100%", //WindowSize.Height * 0.7,
    backgroundColor: backgroundColor,
    position: "absolute",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  DropDownMenuContainer: {
    backgroundColor: "#253959",
    width: "90%",
    minHeight: WindowSize.Width * 0.13,
    //height: WindowSize.Width * 0.13,
    alignSelf: "center",
    padding: "3%",
    borderRadius: WindowSize.Width * 0.02,
  },
});
