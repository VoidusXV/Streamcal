import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";

const Seperator = ({ style }: any) => {
  return (
    <View
      style={{
        width: "100%",
        height: "0.1%",
        backgroundColor: "white",
        ...style,
      }}></View>
  );
};

export default Seperator;

const styles = StyleSheet.create({});
