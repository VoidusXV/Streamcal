import { StyleSheet, Text, TouchableHighlight, View, Modal } from "react-native";
import React from "react";
import { backgroundColor, selectionColor } from "../components/constants/Colors";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { WindowSize } from "../components/constants/Layout";
import { IsServerReachable } from "../backend/serverConnection";

const IconSize = WindowSize.Width * 0.07;
const fontSize = WindowSize.Width * 0.055;

const TitleContainer = () => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      //marginTop: WindowSize.Width * 0.05,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.6)",
      height: WindowSize.Width * 0.15,
    }}>
    <Text style={{ color: "white", fontSize: WindowSize.Width * 0.07 }}>Einstellungen</Text>
  </View>
);

const ServerConnection_Modal = () => {
  return (
    <Modal animationType="slide" visible={true} transparent={true} style={{}}>
      <View style={{ flex: 1, backgroundColor: backgroundColor }}></View>
    </Modal>
  );
};

const SettingButton = () => (
  <TouchableHighlight
    onPress={async () => console.log(await IsServerReachable())}
    underlayColor={"#202d46"}
    style={{
      width: "100%",
      height: "10%",
      flexDirection: "row",
      //justifyContent: "center",
      alignItems: "center",
      //backgroundColor: "red",
      paddingLeft: "5%",
      //marginTop: "5%",
      //borderBottomWidth: 1,
      //borderBottomColor: "rgba(255,255,255,0.3)",
    }}>
    <>
      <MaterialCommunityIcons
        name="connection"
        size={IconSize}
        style={{ marginLeft: "5%" }}
        color="white"></MaterialCommunityIcons>
      <Text style={{ color: "white", fontSize: fontSize, marginLeft: "5%" }}>
        Server Connection
      </Text>
    </>
  </TouchableHighlight>
);

const AccountPage = () => {
  const [isServerConnection_Open, setServerConnection_Open] = React.useState(false);

  return (
    <View style={styles.container}>
      <TitleContainer></TitleContainer>
      <SettingButton></SettingButton>
      <ServerConnection_Modal></ServerConnection_Modal>
    </View>
  );
};

export default AccountPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
