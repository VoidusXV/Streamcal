import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import React from "react";
import { backgroundColor } from "../constants/Colors";
import { WindowSize } from "../constants/Layout";
import SettingsButton, { ISettingsButton } from "./SettingsButton";

interface IErrorView {
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  ErrorText?: any;
  SettingsButtonParams?: ISettingsButton;
}
const ErrorView = ({ style, textStyle, ErrorText, SettingsButtonParams }: IErrorView) => {
  return (
    <View style={{ ...styles.container, ...style }}>
      <Text
        style={{
          ...styles.text,
          ...textStyle,
        }}
      >
        {ErrorText}
      </Text>
      <SettingsButton {...SettingsButtonParams}></SettingsButton>
    </View>
  );
};

export default ErrorView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: WindowSize.Width * 0.06,
    color: "rgba(255,255,255,0.8)",
    marginBottom: "10%",
    maxWidth: "90%",
  },
});
