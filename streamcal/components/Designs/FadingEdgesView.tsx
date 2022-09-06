import { StyleSheet, Text, View, Image, ViewStyle } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { WindowSize } from "../constants/Layout";
import { backgroundColor } from "../constants/Colors";

function isHex(text: any) {
  return text.include("#");
}

function HexToRGB(HexString: any) {
  const r = HexString[1] + HexString[2];
  const g = HexString[3] + HexString[4];
  const b = HexString[5] + HexString[6];
  //const rgb = `${parseInt(r, 16)}${parseInt(g, 16)}${parseInt(b, 16)}`;
  return { r: r, g: g, b: b };
}

function p(text: any) {
  if (!text) return 0;

  if (text.includes("%")) {
    const a = text.replace("%", "");
    return Number(a);
  }
  return 0;
}
interface IFadingEdgesView {
  style?: ViewStyle | ViewStyle[];
  children?: any;
  ParentBackgroundColor: any;
}

const FadingEdgesView: React.FC<IFadingEdgesView> = ({
  style,
  children,
  ParentBackgroundColor,
}: any) => {
  const [getLayout, setLayout] = React.useState<any>({});
  return (
    <View style={style} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
      <LinearGradient
        colors={[ParentBackgroundColor, `rgba(0,0,0,0)`]}
        locations={[0.0, 0.2]}
        style={{
          height: "100%",
          width: "100%",
          zIndex: 1,
          position: "absolute",
        }}
      ></LinearGradient>

      {children}

      <LinearGradient
        colors={[`rgba(0,0,0,0)`, ParentBackgroundColor]}
        locations={[0.0, 0.8]}
        style={{
          height: "25%",
          width: "100%",
          zIndex: 1,
          position: "absolute",
          marginTop: getLayout.height ? getLayout.height - WindowSize.Height * 0.3 : 0,
        }}
      ></LinearGradient>
    </View>
  );
};

export default FadingEdgesView;

const styles = StyleSheet.create({});
