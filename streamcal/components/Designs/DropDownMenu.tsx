import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { WindowSize } from "../constants/Layout";

interface IDropDownMenu {
  children?: any;
  endHeight: any;
}
const DropDownMenu: React.FC<IDropDownMenu> = ({ children, endHeight }: any) => {
  const ViewRef = React.useRef<View>(null);
  const AnimViewRef = React.useRef<Animated.WithAnimatedValue<View>>(null);

  const startHeight = WindowSize.Height * 0.07;
  const duration = 300;
  const AnimHeight = React.useRef(new Animated.Value(startHeight)).current;

  const [isOpen, setOpen] = React.useState(false);

  function onPress() {
    setOpen(!isOpen);
    if (!isOpen)
      Animated.timing(AnimHeight, {
        toValue: endHeight, //WindowSize.Height * 0.6,
        useNativeDriver: false,
        duration: duration,
      }).start();

    if (isOpen)
      Animated.timing(AnimHeight, {
        toValue: startHeight,
        useNativeDriver: false,
        duration: duration,
      }).start();
  }
  //AnimHeight
  return (
    <Animated.View
      ref={AnimViewRef}
      style={{ ...styles.DropDownMenuContainer, height: AnimHeight }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          //height: WindowSize.Width * 0.08,
        }}
      >
        <MaterialIcons
          name="arrow-forward-ios"
          size={WindowSize.Width * 0.05}
          color="white"
        ></MaterialIcons>
        <Text style={{ color: "white", marginLeft: "2%", fontSize: WindowSize.Width * 0.05 }}>
          Enter Connection manually
        </Text>
      </TouchableOpacity>

      {/* <View style={{ flexShrink: 1, backgroundColor: "red", marginTop: "4%" }}>
          <SettingsButton style={{ opacity: 0 }}></SettingsButton>
          <SettingsButton style={{ opacity: 0 }}></SettingsButton>
          <SettingsButton style={{ opacity: 0 }}></SettingsButton>
          <SettingsButton style={{ opacity: 0 }}></SettingsButton>
          <SettingsButton style={{ opacity: 0 }}></SettingsButton>
        </View> */}
      <View style={{ backgroundColor: "red", marginTop: WindowSize.Height * 0.04 }}>
        {children}
      </View>
    </Animated.View>
  );
};

export default DropDownMenu;

const styles = StyleSheet.create({
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
