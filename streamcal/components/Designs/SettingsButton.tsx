import { StyleSheet, Text, TextStyle, TouchableHighlight, View, ViewStyle } from "react-native";
import React from "react";
import { WindowSize } from "../constants/Layout";
const IconSize = WindowSize.Width * 0.07;
const fontSize = WindowSize.Width * 0.055;

interface ISettingsButton {
  onPress?: any;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  ButtonText?: any;
  IconFamily?: any;
  IconName?: any;
}

const SettingsButton: React.FC<ISettingsButton> = ({
  onPress,
  style,
  textStyle,
  ButtonText,
  IconFamily,
  IconName,
}: any) => (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={"#202d46"}
    style={{
      width: "90%",
      paddingTop: "3%",
      paddingBottom: "3%",

      //height: WindowSize.Height * 0.07,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: IconFamily ? "5%" : 0,
      backgroundColor: "#253959",
      borderRadius: WindowSize.Width * 0.01,
      ...style,
    }}>
    <>
      {IconFamily ? (
        <>
          <IconFamily
            name={IconName}
            size={IconSize}
            style={{ marginLeft: "5%" }}
            color="white"></IconFamily>
          <Text style={{ color: "white", fontSize: fontSize, marginLeft: "5%", ...textStyle }}>
            {ButtonText}
          </Text>
        </>
      ) : (
        <Text style={{ color: "white", fontSize: fontSize, ...textStyle }}>{ButtonText}</Text>
      )}
    </>
  </TouchableHighlight>
);

export default SettingsButton;

const styles = StyleSheet.create({});
