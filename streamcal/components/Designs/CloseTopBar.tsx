import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { backgroundColor } from "../constants/Colors";
import { smallTitleFont, TitleFont } from "./Fonts";
import { MaterialIcons } from "@expo/vector-icons";
import { WindowSize } from "../constants/Layout";

interface CloseTopBar {
  Icon?: "arrow-back" | "close";
  Title?: any;
  onPress?: any;
}
const CloseTopBar = ({ Icon, Title, onPress }: CloseTopBar) => {
  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: "3%",
        paddingBottom: "3%",
        paddingLeft: "5%",
      }}>
      <MaterialIcons
        onPress={onPress}
        name={Icon}
        size={WindowSize.Width * 0.08}
        color="white"></MaterialIcons>

      <Text numberOfLines={1} style={{ ...smallTitleFont, marginLeft: "4%", maxWidth: "80%" }}>
        {Title}
      </Text>
    </View>
  );
};

export default CloseTopBar;

const styles = StyleSheet.create({});
