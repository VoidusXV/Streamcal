import {
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Animated,
  TextComponent,
  Keyboard,
} from "react-native";
import React, { useRef, useState } from "react";
import { WindowSize } from "../constants/Layout";
import { Ionicons } from "@expo/vector-icons";
import { backgroundColor, selectionColor } from "../constants/Colors";

interface ITextInput {
  PlaceholderText?: String;
  onPress?: () => void;
  bodyStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  isPasswordInput?: boolean;
  isSecure?: boolean;
  maxLength?: number;
  defaultValue?: string;
}
const NormalTextInput: React.FC<ITextInput> = ({
  PlaceholderText,
  bodyStyle,
  textStyle,
  maxLength,
  onChangeText,
  defaultValue,
}: any) => {
  const [getDefaultValue, setDefaultValue] = React.useState(defaultValue);

  console.log("first");
  React.useEffect(() => {
    setDefaultValue(defaultValue);
    ClearButtonVisibility(defaultValue);
  }, [defaultValue]);

  const start = WindowSize.Width * 0.1;
  const rightValue = React.useRef(new Animated.Value(start)).current;

  function showClearButton() {
    Animated.timing(rightValue, {
      toValue: 0,
      duration: 170,
      useNativeDriver: false,
    }).start();
  }

  function hideClearButton() {
    Animated.timing(rightValue, {
      toValue: start,
      duration: 170,
      useNativeDriver: false,
    }).start();
  }

  function ClearButtonVisibility(text: any) {
    if (text == undefined) return;
    if (text.length == 0) {
      hideClearButton();
    } else {
      showClearButton();
    }
  }
  return (
    <View style={[styles.TextInputBodyStyle, bodyStyle]}>
      <TextInput
        maxLength={maxLength}
        style={[styles.TextInputTextStyle, textStyle]}
        placeholderTextColor={"rgba(255,255,255,0.6)"}
        placeholder={PlaceholderText}
        selectionColor={"white"}
        //defaultValue={getDefaultValue}
        onChangeText={(text) => {
          ClearButtonVisibility(text);
          setDefaultValue(text);
          onChangeText && onChangeText(text);
        }}
        value={getDefaultValue}></TextInput>
      <TouchableOpacity
        style={{ justifyContent: "space-around", marginLeft: "4%", flex: 1 }}
        activeOpacity={0.7}>
        <Animated.View style={{ paddingLeft: rightValue }}>
          <Ionicons
            name={"close-circle-sharp"}
            size={24}
            color="white"
            onPress={() => {
              setDefaultValue("");
              hideClearButton();
            }}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  TextInputTextStyle: {
    fontSize: WindowSize.Width * 0.05,
    color: "white",
    paddingLeft: "5%",
    maxWidth: "85%",
    width: "85%",
    textAlign: "left",
  },
  TextInputBodyStyle: {
    width: "90%",
    height: WindowSize.Height * 0.07,
    backgroundColor: "#253959",
    borderRadius: WindowSize.Width * 0.01,
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});

export { NormalTextInput };
