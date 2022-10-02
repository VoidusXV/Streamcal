import { StyleSheet, Text, View, Animated } from "react-native";
import React from "react";
import { WindowSize } from "../constants/Layout";
import { selectionColor } from "../constants/Colors";

const StartValue = WindowSize.Height * -0.15;
//const EndValue = 30;
let Animated_Height = new Animated.Value(StartValue);

let timer: any = null;

function ShowHide_Animation(
  show = true,
  Animated_Height: any,
  StartValue = WindowSize.Height * -0.15,
  EndValue = 30
) {
  Animated.timing(Animated_Height, {
    toValue: show ? EndValue : StartValue,
    duration: 120,
    useNativeDriver: false,
  }).start();
}

function Animation_Main() {
  if (timer) return;
  ShowHide_Animation(true, Animated_Height);
  timer = setTimeout(() => {
    ShowHide_Animation(false, Animated_Height);
    timer = null;
  }, 3000);
}
interface INotifyBox {
  visible?: any;
  MessageText?: any;
}
const NotifyBox: React.FC<INotifyBox> = ({ MessageText }: any) => {
  const [getMessageText, setMessageText] = React.useState("");
  React.useEffect(() => {
    setMessageText(MessageText);
  }, [MessageText]);
  return (
    <Animated.View
      onTouchEnd={() => ShowHide_Animation(false, Animated_Height)}
      style={{ ...styles.container, marginTop: Animated_Height }}
    >
      <Text style={styles.MessageStyle}>{getMessageText}</Text>
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
