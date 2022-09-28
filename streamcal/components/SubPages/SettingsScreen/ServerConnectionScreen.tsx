import { StyleSheet, Text, ScrollView, Alert } from "react-native";
import React from "react";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { backgroundColor } from "../../constants/Colors";
import { WindowSize } from "../../constants/Layout";
import { NormalTextInput } from "../../Designs/TextInput";
import SettingsButton from "../../Designs/SettingsButton";
import { GetData_AsyncStorage, StoreData_AsyncStorage } from "../../DataHandling";
import { IsServerReachable } from "../../../backend/serverConnection";

interface IServerInfo {
  APIKEY?: any;
  Server?: any;
  Port?: any;
  AdminKey?: any;
}

async function ConnectToServer(getServerInfo: any, onLoadStarted?: any, onLoadEnded?: any) {
  if (!getServerInfo) return;
  const currentConnection: IServerInfo = getServerInfo;

  onLoadStarted && onLoadStarted();
  await StoreData_AsyncStorage("currentConnection", currentConnection);
  const serverStatus = await IsServerReachable();
  onLoadEnded && onLoadEnded();

  if (!serverStatus) {
    Alert.alert("Error", "Server is Offline");
  }
}

const ServerConnectionScreen = ({ navigation, route }: any) => {
  const [isLoading, setIsLoading] = React.useState<any>(false);

  const [getServerInfo, setServerInfo] = React.useState<IServerInfo>({});
  const newServerConnection: IServerInfo = route.params || null;

  React.useEffect(() => {
    (async () => {
      console.log("Load ServerConnectionScreen");
      const Storage_currentConnection = await GetData_AsyncStorage("currentConnection");
      setServerInfo(newServerConnection || Storage_currentConnection || {});
    })();
  }, [newServerConnection]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: backgroundColor }}
      contentContainerStyle={{ paddingBottom: WindowSize.Width * 0.1 }}>
      <>
        <NormalTextInput
          defaultValue={getServerInfo?.Server}
          bodyStyle={{ ...styles.NormalTextInputStyle }}
          PlaceholderText={"Server Domain"}></NormalTextInput>
        <NormalTextInput
          defaultValue={getServerInfo?.Port}
          bodyStyle={{ ...styles.NormalTextInputStyle }}
          PlaceholderText={"Port"}></NormalTextInput>
        <NormalTextInput
          defaultValue={getServerInfo?.APIKEY}
          bodyStyle={{ ...styles.NormalTextInputStyle }}
          PlaceholderText={"API-KEY"}></NormalTextInput>
        <SettingsButton
          IconFamily={MaterialCommunityIcons}
          IconName={"qrcode-scan"}
          ButtonText="Scan QR-Code"
          onPress={() => navigation.navigate("QRCode_ScannerScreen")}
          style={{
            marginLeft: WindowSize.Width * 0.05,
            marginTop: WindowSize.Width * 0.05,
          }}></SettingsButton>
        <Text
          style={{
            fontSize: WindowSize.Width * 0.04,
            color: "white",
            marginTop: WindowSize.Width * 0.05,
            marginLeft: WindowSize.Width * 0.05,

            textAlign: "left",
          }}>
          Use Your Admin-Key for Admin-Access
        </Text>
        <NormalTextInput
          bodyStyle={{ ...styles.NormalTextInputStyle, alignSelf: "center" }}
          defaultValue={getServerInfo.AdminKey}
          PlaceholderText={"Admin-KEY"}></NormalTextInput>

        <SettingsButton
          IconFamily={MaterialCommunityIcons}
          IconName={"connection"}
          ButtonText="Connect To Server"
          onPress={async () => await ConnectToServer(getServerInfo)}
          style={{
            marginLeft: WindowSize.Width * 0.05,
            marginTop: WindowSize.Width * 0.05,
          }}></SettingsButton>
        <SettingsButton
          IconFamily={MaterialCommunityIcons}
          IconName={"history"}
          ButtonText="History"
          onPress={async () => console.log(await GetData_AsyncStorage("currentConnection"))}
          style={{
            marginLeft: WindowSize.Width * 0.05,
            marginTop: WindowSize.Width * 0.05,
          }}></SettingsButton>
      </>
    </ScrollView>
  );
};

export default ServerConnectionScreen;

const styles = StyleSheet.create({
  NormalTextInputStyle: {
    marginTop: WindowSize.Width * 0.05,
    alignSelf: "center",
  },
});
