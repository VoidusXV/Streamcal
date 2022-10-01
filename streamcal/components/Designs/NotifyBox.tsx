import { StyleSheet, Text, View, Animated } from "react-native";
import React from "react";
import { WindowSize } from "../constants/Layout";
import { selectionColor } from "../constants/Colors";

const StartValue = WindowSize.Height * -0.15;
const EndValue = 30;
let Animated_Height = new Animated.Value(StartValue);
let MessageText = "";
function getMessageText() {
  return MessageText;
}
function ShowHide_Animation(show = true) {
  Animated.timing(Animated_Height, {
    toValue: show ? EndValue : StartValue,
    duration: 120,
    useNativeDriver: false,
  }).start();
}

function Animation_Main(text?: any) {
  console.log("Tett3");
  MessageText = text;
  ShowHide_Animation(true);
  setTimeout(() => {
    ShowHide_Animation(false);
  }, 3000);
}

const NotifyBox = () => {
  //   React.useEffect(() => {
  //     Animation_Main();
  //   }, []);

  // transform: [{ translateY: WindowSize.Width * 0.05 }] }
  return (
    <Animated.View style={{ ...styles.container, marginTop: Animated_Height }}>
      <Text style={styles.MessageStyle}>{getMessageText()}</Text>
    </Animated.View>
  );
};

export default NotifyBox;
export { Animation_Main };
const styles = StyleSheet.create({
  container: {
    minHeight: WindowSize.Width * 0.12,
    position: "absolute",
    padding: "4%",
    //marginTop: "5%",
    width: "90%",
    zIndex: 1,
    backgroundColor: selectionColor,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: WindowSize.Width * 0.02,
  },
  MessageStyle: {
    color: "white",
    fontSize: WindowSize.Width * 0.045,
  },
});
