import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { backgroundColor } from "../../constants/Colors";
import SettingsButton from "../../Designs/SettingsButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WindowSize } from "../../constants/Layout";
const TitleContainer = () => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      //marginTop: WindowSize.Width * 0.05,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.6)",
      height: WindowSize.Width * 0.15,
      width: "100%",
    }}>
    <Text style={{ color: "white", fontSize: WindowSize.Width * 0.07 }}>Einstellungen</Text>
  </View>
);

const Settings_DefaultScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <TitleContainer></TitleContainer>

      <SettingsButton
        onPress={() => navigation.navigate("ServerConnectionScreen")}
        IconFamily={MaterialCommunityIcons}
        IconName={"connection"}
        style={styles.SettingsButtonStyle}
        ButtonText={"Server Connection"}></SettingsButton>
      <SettingsButton
        onPress={() => console.log("first")}
        IconFamily={MaterialCommunityIcons}
        IconName={"account-edit"}
        style={styles.SettingsButtonStyle}
        ButtonText={"Manage Users"}></SettingsButton>
    </View>
  );
};

export default Settings_DefaultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    //justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: backgroundColor,
  },
  SettingsButtonStyle: {
    marginTop: "5%",
  },
});
