import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Vibration,
} from "react-native";
import React from "react";
import { backgroundColor } from "../components/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WindowSize } from "../components/constants/Layout";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ServerConnectionScreen from "../components/SubPages/SettingsScreen/ServerConnectionScreen";
import Settings_DefaultScreen from "../components/SubPages/SettingsScreen/Settings_DefaultScreen";
import QRCode_Scanner from "../components/SubPages/SettingsScreen/QRCode_Scanner";
import ServerHistoryScreen from "../components/SubPages/SettingsScreen/ServerHistoryScreen";

const IconSize = WindowSize.Width * 0.07;
const fontSize = WindowSize.Width * 0.055;

const Stack = createNativeStackNavigator();

const TitleContainer = () => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      //marginTop: WindowSize.Width * 0.05,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.6)",
      height: WindowSize.Width * 0.15,
    }}
  >
    <Text style={{ color: "white", fontSize: WindowSize.Width * 0.07 }}>Einstellungen</Text>
  </View>
);

const SettingButton = ({ onPress, style, ButtonText, IconFamily, IconName }: any) => (
  <TouchableHighlight
    onPress={onPress}
    underlayColor={"#202d46"}
    style={{
      width: "90%",
      height: WindowSize.Height * 0.07,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: "5%",
      backgroundColor: "#253959",
      borderRadius: WindowSize.Width * 0.01,
      ...style,
    }}
  >
    <>
      <IconFamily
        name={IconName}
        size={IconSize}
        style={{ marginLeft: "5%" }}
        color="white"
      ></IconFamily>
      <Text style={{ color: "white", fontSize: fontSize, marginLeft: "5%" }}>{ButtonText}</Text>
    </>
  </TouchableHighlight>
);

const ServerConnection_Modal = ({ visible, onRequestClose }: any) => {
  StatusBar.setBarStyle("light-content");

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      style={{ backgroundColor: "red" }}
      onRequestClose={onRequestClose}
    >
      <View style={{ width: "100%", height: "100%", backgroundColor: backgroundColor }}>
        <MaterialCommunityIcons name="history" size={24} color="white" />
        {/* <SettingButton onPress={() => console.log("teteitj485t9")}></SettingButton> */}
      </View>
    </Modal>
  );
};

const SettingsScreen = ({ navigation }: any) => {
  // const [getNavigationStateIndex, setNavigationStateIndex] = React.useState(0);

  const NavigatorListener = (state: any) => {
    //setNavigationStateIndex(state.data.state.index);
    if (state.data.state.index == 0) {
      navigation.setOptions({
        tabBarStyle: { backgroundColor: backgroundColor, display: "flex" },
        tabBarLabelStyle: { color: "white" },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: { backgroundColor: backgroundColor, display: "none" },
        tabBarLabelStyle: { color: "white" },
      });
    }
  };

  return (
    <Stack.Navigator
      screenListeners={{
        state: NavigatorListener,
      }}
      screenOptions={{
        contentStyle: { backgroundColor: backgroundColor },
        headerShown: false,
        //headerMode: "none",
        presentation: "fullScreenModal",
        //animationDuration: 1,
        //animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Settings_DefaultScreen" component={Settings_DefaultScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: backgroundColor },
          headerTintColor: "white",
          headerTitle: "Server Connection",
        }}
        name="ServerConnectionScreen"
        component={ServerConnectionScreen}
      ></Stack.Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: backgroundColor },
          headerTintColor: "white",
          headerTitle: "Server Connection History",
        }}
        name="ServerHistoryScreen"
        component={ServerHistoryScreen}
      ></Stack.Screen>
      <Stack.Screen name="QRCode_ScannerScreen" component={QRCode_Scanner}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    //alignItems: "center",
    //justifyContent: "center",
    width: "100%",
    height: "100%", //WindowSize.Height * 0.7,
    backgroundColor: backgroundColor,
    position: "absolute",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  NormalTextInputStyle: {
    marginTop: WindowSize.Width * 0.05,
    alignSelf: "center",
  },
});
