import { StyleSheet, Text, View, ViewStyle } from "react-native";
import React from "react";

interface ISeperator {
  style?: ViewStyle | ViewStyle[];
}
const Seperator: React.FC<ISeperator> = ({ style }: any) => {
  return (
    <View
      style={{
        width: "100%",
        height: "0.1%",
        backgroundColor: "grey", //"white",
        ...style,
      }}></View>
  );
};

export default Seperator;

const styles = StyleSheet.create({});
