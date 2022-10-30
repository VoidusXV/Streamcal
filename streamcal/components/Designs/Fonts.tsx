import { StyleSheet, Text, View } from "react-native";
import { WindowSize } from "../constants/Layout";

const styles = StyleSheet.create({
  smallFont: { color: "#e0ebff", fontSize: WindowSize.Width * 0.05, maxWidth: "90%" },
  smallTitleFont: { color: "#e0ebff", fontSize: WindowSize.Width * 0.06, maxWidth: "90%" },
  TitleFont: { color: "#e0ebff", fontSize: WindowSize.Width * 0.07, maxWidth: "90%" },
});

const smallFont = styles.smallFont;
const smallTitleFont = styles.smallTitleFont;
const TitleFont = styles.TitleFont;

export { smallFont, smallTitleFont, TitleFont };
