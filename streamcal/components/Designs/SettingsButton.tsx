import { StyleSheet, Text, TouchableHighlight, View, ViewStyle } from "react-native";
import React from "react";
import { WindowSize } from "../constants/Layout";
const IconSize = WindowSize.Width * 0.07;
const fontSize = WindowSize.Width * 0.055;

interface ISettingsButton {
  onPress?: any;
  style?: ViewStyle | ViewStyle[];
  ButtonText?: any;
  IconFamily?: any;
  IconName?: any;
}

const SettingsButton: React.FC<ISettingsButton> = ({
  onPress,
  style,
  ButtonText,
  IconFamily,
  IconName,
}: any) => (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={"#202d46"}
    style={{
      width: "90%",
      height: WindowSize.Height * 0.07,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: "5%",
      backgroundColor: "#253959",
      borderRadius: WindowSize.Width * 0.01,
      ...style,
    }}>
    <>
      {IconFamily && (
        <IconFamily
          name={IconName}
          size={IconSize}
          style={{ marginLeft: "5%" }}
          color="white"></IconFamily>
      )}
      <Text style={{ color: "white", fontSize: fontSize, marginLeft: "5%" }}>{ButtonText}</Text>
    </>
  </TouchableHighlight>
);

export default SettingsButton;

const styles = StyleSheet.create({});
