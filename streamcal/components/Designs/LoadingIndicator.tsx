import { StyleSheet, Text, View, ActivityIndicator, ViewStyle } from "react-native";
import React from "react";
import { selectionColor } from "../constants/Colors";
import { WindowSize } from "../constants/Layout";

interface ILoadingIndicator {
  style?: ViewStyle | ViewStyle[];
}
const LoadingIndicator: React.FC<ILoadingIndicator> = ({ style }: any) => {
  const LoadingIndicatorSize = WindowSize.Width * 0.2;
  return (
    <View style={{ ...styles.container, ...style }}>
      <ActivityIndicator
        size={LoadingIndicatorSize}
        color={selectionColor}
        style={{ marginBottom: 0 }}></ActivityIndicator>
    </View>
  );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    //backgroundColor: "red",
    width: "100%",
    height: WindowSize.Height,
    alignItems: "center",
    justifyContent: "center",
  },
});
